use crate::http_metrics::{ContentType, HttpMetrics, KeyValue, PostierObject, RequestData, ResponseData};
use hyper::{Body, Client, Method, Request, Response, Uri};
use hyper_rustls::HttpsConnectorBuilder;
use hyper_timeout::TimeoutConnector;
use hyper_trust_dns::TrustDnsResolver;
use socket2::{Domain, Protocol, Socket, Type};
use std::convert::TryFrom;
use std::net::SocketAddr;
use std::str::FromStr;
use std::time::{Duration, Instant};
use std::error::Error;
use url::Url;
use tokio::io::AsyncReadExt;

// ts types to hyper types
impl From<super::HttpMethod> for Method {
    fn from(method: super::HttpMethod) -> Self {
        match method {
            super::HttpMethod::GET => Method::GET,
            super::HttpMethod::POST => Method::POST,
            super::HttpMethod::PUT => Method::PUT,
            super::HttpMethod::DELETE => Method::DELETE,
            super::HttpMethod::HEAD => Method::HEAD,
            super::HttpMethod::OPTIONS => Method::OPTIONS,
            super::HttpMethod::PATCH => Method::PATCH,
        }
    }
}

// format headers like in the ts version
fn format_headers(headers: &[KeyValue]) -> std::collections::HashMap<String, String> {
    headers
        .iter()
        .filter(|header| header.enabled && !header.key.trim().is_empty() && !header.value.trim().is_empty())
        .map(|header| (header.key.clone(), header.value.clone()))
        .collect()
}

// get content type header like in the ts version
fn get_content_type_header(content_type: &ContentType) -> String {
    match content_type {
        ContentType::FormData => "multipart/form-data".to_string(),
        ContentType::Text => "text/plain".to_string(),
        ContentType::JavaScript => "application/javascript".to_string(),
        ContentType::Json => "application/json".to_string(),
        ContentType::Html => "text/html".to_string(),
        ContentType::Xml => "application/xml".to_string(),
        ContentType::None => "".to_string(),
    }
}

// format request body like in the ts version
fn format_request_body(body: &str, content_type: &ContentType) -> Body {
    if let ContentType::None = content_type {
        return Body::empty();
    }

    if body.is_empty() {
        return Body::empty();
    }

    if let ContentType::Json = content_type {
        // we don't try to validate the json here, we let the server do it
        Body::from(body.to_string())
    } else {
        Body::from(body.to_string())
    }
}

pub async fn send_request(request_data: RequestData) -> Result<PostierObject, String> {
    let start_time = Instant::now();
    let prepare_start = start_time;
    
    // metrics
    let mut metrics = HttpMetrics {
        prepare: 0.0,
        socket_init: 0.0,
        dns_lookup: 0.0,
        tcp_handshake: 0.0,
        transfer_start: 0.0,
        download: 0.0,
        process: 0.0,
        total: 0.0,
    };

    // prepare request
    let url = request_data.composed_url.clone();
    let method: Method = request_data.method.clone().into();
    
    // prepare headers
    let mut formatted_headers = request_data.headers
        .as_ref()
        .map(|headers| format_headers(headers))
        .unwrap_or_default();
    
    // add content type if needed
    if let Some(content_type) = &request_data.content_type {
        if content_type != &ContentType::None && !formatted_headers.contains_key("Content-Type") {
            let content_type_value = get_content_type_header(content_type);
            if !content_type_value.is_empty() {
                formatted_headers.insert("Content-Type".to_string(), content_type_value);
            }
        }
    }
    
    // add user agent
    formatted_headers.insert("User-Agent".to_string(), "PostierRuntime/1.0.0".to_string());
    
    // build request body
    let body = match (&request_data.body, &request_data.content_type) {
        (Some(body), Some(content_type)) => format_request_body(body, content_type),
        _ => Body::empty(),
    };
    
    // build request
    let mut request_builder = Request::builder()
        .method(method)
        .uri(url.clone());
    
    // add headers
    for (key, value) in formatted_headers {
        request_builder = request_builder.header(key, value);
    }
    
    let request = match request_builder.body(body) {
        Ok(req) => req,
        Err(e) => {
            return Err(format!("Failed to build request: {}", e));
        }
    };
    
    metrics.prepare = prepare_start.elapsed().as_secs_f64() * 1000.0;
    
    // init socket and dns resolution
    let socket_init_start = Instant::now();
    
    // use trust-dns for precise dns resolution
    let dns_start = Instant::now();
    
    // use hyper with rustls and trust-dns
    let resolver = TrustDnsResolver::default();
    let https_connector = resolver.into_rustls_native_https_connector();
    
    // add a timeout
    let mut connector = TimeoutConnector::new(https_connector);
    connector.set_connect_timeout(Some(Duration::from_secs(30)));
    connector.set_read_timeout(Some(Duration::from_secs(30)));
    connector.set_write_timeout(Some(Duration::from_secs(30)));
    
    let client = Client::builder().build(connector);
    
    metrics.socket_init = socket_init_start.elapsed().as_secs_f64() * 1000.0;
    
    // dns resolution
    let uri = Uri::from_str(&url).map_err(|e| format!("Invalid URI: {}", e))?;
    let host = uri.host().ok_or("No host in URL")?;
    let port = uri.port_u16().unwrap_or(if uri.scheme_str() == Some("https") { 443 } else { 80 });
    
    metrics.dns_lookup = dns_start.elapsed().as_secs_f64() * 1000.0;
    
    // tcp handshake
    let tcp_start = Instant::now();
    let socket_addr = format!("{}:{}", host, port);
    let socket_addr = SocketAddr::from_str(&socket_addr).map_err(|e| format!("Invalid socket address: {}", e))?;
    
    // create a socket manually
    let socket = Socket::new(Domain::IPV4, Type::STREAM, Some(Protocol::TCP))
        .map_err(|e| format!("Failed to create socket: {}", e))?;
    
    // try to connect to measure the handshake
    let _result = socket.connect(&socket_addr.into());
    
    metrics.tcp_handshake = tcp_start.elapsed().as_secs_f64() * 1000.0;
    
    // start transfer
    let transfer_start = Instant::now();
    
    // perform request
    let response_result = client.request(request).await;
    
    metrics.transfer_start = transfer_start.elapsed().as_secs_f64() * 1000.0;
    
    // download
    let download_start = Instant::now();
    
    let response_data = match response_result {
        Ok(response) => {
            let status = response.status().as_u16();
            let status_text = response.status().canonical_reason().unwrap_or("").to_string();
            
            // convert headers to KeyValue
            let headers: Vec<KeyValue> = response
                .headers()
                .iter()
                .map(|(key, value)| {
                    KeyValue {
                        key: key.to_string(),
                        value: String::from_utf8_lossy(value.as_bytes()).to_string(),
                        enabled: true,
                    }
                })
                .collect();
            
            // read body
            let (parts, body) = response.into_parts();
            let body_bytes = hyper::body::to_bytes(body)
                .await
                .map_err(|e| format!("Failed to read body: {}", e))?;
            
            let body_size = body_bytes.len();
            let body_str = String::from_utf8_lossy(&body_bytes).to_string();
            
            metrics.download = download_start.elapsed().as_secs_f64() * 1000.0;
            
            // process
            let process_start = Instant::now();
            
            // create response object
            let response_data = ResponseData {
                id: request_data.id.clone(),
                timestamp: chrono::Utc::now().timestamp_millis() as u64,
                status,
                status_text,
                headers: Some(headers),
                data: Some(body_str),
                time: start_time.elapsed().as_secs_f64() * 1000.0,
                size: body_size,
            };
            
            metrics.process = process_start.elapsed().as_secs_f64() * 1000.0;
            
            Ok(response_data)
        }
        Err(err) => {
            let end_time = Instant::now();
            
            // handle different types of errors like in the ts version
            let response_data = ResponseData {
                id: request_data.id.clone(),
                timestamp: chrono::Utc::now().timestamp_millis() as u64,
                status: 0,
                status_text: format!("Request Error: {}", err),
                headers: None,
                data: Some(format!("Error: {}", err)),
                time: end_time.elapsed().as_secs_f64() * 1000.0,
                size: 0,
            };
            
            metrics.download = download_start.elapsed().as_secs_f64() * 1000.0;
            metrics.process = 0.0;
            
            Ok(response_data)
        }
    };
    
    // calculate total time
    metrics.total = start_time.elapsed().as_secs_f64() * 1000.0;
    
    // create return object
    match response_data {
        Ok(response) => {
            // debug informations
            let debug = vec![
                KeyValue {
                    key: "Postier UID".to_string(),
                    value: request_data.id.clone(),
                    enabled: true,
                },
                KeyValue {
                    key: "Request time".to_string(),
                    value: format!("{}ms", response.time),
                    enabled: true,
                },
                KeyValue {
                    key: "Processing time".to_string(),
                    value: format!("{}ms", metrics.total),
                    enabled: true,
                },
                KeyValue {
                    key: "Request url".to_string(),
                    value: url.clone(),
                    enabled: true,
                },
                KeyValue {
                    key: "Response status".to_string(),
                    value: format!("{} ({})", response.status, response.status_text),
                    enabled: true,
                },
                KeyValue {
                    key: "Response body".to_string(),
                    value: format!("blob size: {} bytes", response.size),
                    enabled: true,
                },
                // detailed metrics
                KeyValue {
                    key: "Metrics - Prepare".to_string(),
                    value: format!("{:.2}ms", metrics.prepare),
                    enabled: true,
                },
                KeyValue {
                    key: "Metrics - Socket Init".to_string(),
                    value: format!("{:.2}ms", metrics.socket_init),
                    enabled: true,
                },
                KeyValue {
                    key: "Metrics - DNS Lookup".to_string(),
                    value: format!("{:.2}ms", metrics.dns_lookup),
                    enabled: true,
                },
                KeyValue {
                    key: "Metrics - TCP Handshake".to_string(),
                    value: format!("{:.2}ms", metrics.tcp_handshake),
                    enabled: true,
                },
                KeyValue {
                    key: "Metrics - Transfer Start".to_string(),
                    value: format!("{:.2}ms", metrics.transfer_start),
                    enabled: true,
                },
                KeyValue {
                    key: "Metrics - Download".to_string(),
                    value: format!("{:.2}ms", metrics.download),
                    enabled: true,
                },
                KeyValue {
                    key: "Metrics - Process".to_string(),
                    value: format!("{:.2}ms", metrics.process),
                    enabled: true,
                },
                KeyValue {
                    key: "Metrics - Total".to_string(),
                    value: format!("{:.2}ms", metrics.total),
                    enabled: true,
                },
            ];
            
            Ok(PostierObject {
                request: request_data,
                response,
                debug,
                metrics,
            })
        }
        Err(e) => Err(e),
    }
} 