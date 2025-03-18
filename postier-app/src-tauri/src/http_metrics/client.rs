use crate::http_metrics::{ContentType, HttpMetrics, KeyValue, PostierObject, RequestData, ResponseData};
use reqwest::{Client, Method};
use std::time::Instant;
use trust_dns_resolver::TokioAsyncResolver;
use url::Url;

// ts types to reqwest types
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

fn normalize_url(url: &str) -> Result<String, String> {
    if url.split(':').next().unwrap_or("").parse::<std::net::IpAddr>().is_ok() {
        return Ok(format!("http://{}", url));
    }

    let url_str = if !url.contains("://") {
        format!("https://{}", url)
    } else {
        url.to_string()
    };

    Url::parse(&url_str)
        .map(|u| u.to_string())
        .map_err(|e| format!("Invalid URL format: {}", e))
}

pub async fn send_request(request_data: RequestData) -> Result<PostierObject, String> {
    let start_time = Instant::now();
    
    // metrics
    let mut metrics = HttpMetrics {
        prepare: 0.0,
        dns_lookup: 0.0,
        tcp_handshake: 0.0,
        response_time: 0.0,
        process: 0.0,
    };

    // prepare request
    let url = normalize_url(&request_data.composed_url)
        .map_err(|e| format!("URL normalization failed: {}", e))?;
    let method: Method = request_data.method.clone().into();
    
    // prepare headers
    let mut formatted_headers = request_data.headers
        .as_ref()
        .map(|headers| format_headers(headers))
        .unwrap_or_default();
    
    // add content type if needed
    if let Some(content_type) = &request_data.content_type {
        if !matches!(content_type, ContentType::None) && !formatted_headers.contains_key("Content-Type") {
            let content_type_value = get_content_type_header(content_type);
            if !content_type_value.is_empty() {
                formatted_headers.insert("Content-Type".to_string(), content_type_value);
            }
        }
    }
    
    // add user agent
    formatted_headers.insert("User-Agent".to_string(), "PostierRuntime".to_string());
    
    // Parse the URL to get the host
    let url_parsed = Url::parse(&url)
        .map_err(|e| format!("Failed to parse URL: {}", e))?;
    let host = url_parsed.host_str().ok_or("Could not extract host")?;

    // Create a DNS resolver
    let resolver = TokioAsyncResolver::tokio_from_system_conf()
        .map_err(|e| format!("Failed to create DNS resolver: {}", e))?;

    // Create HTTP client
    let client = Client::builder()
        .no_proxy()
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
                
    metrics.prepare = start_time.elapsed().as_secs_f64() * 1000.0;

    // Measure DNS resolution time
    let start_dns = Instant::now();
    resolver.lookup_ip(host)
        .await
        .map_err(|e| format!("DNS resolution failed: {}", e))?;
    metrics.dns_lookup = start_dns.elapsed().as_secs_f64() * 1000.0;

    // Build request
    let mut request_builder = client.request(method, &url);
    
    // Add headers
    for (key, value) in formatted_headers {
        request_builder = request_builder.header(key, value);
    }
    
    // Add body if present
    if let Some(body) = &request_data.body {
        request_builder = request_builder.body(body.clone());
    }

    // Measure TCP connection and TLS handshake time
    let start_tcp = Instant::now();
    let response = request_builder.send()
        .await
        .map_err(|e| format!("Failed to send HTTP request: {}", e))?;
    metrics.tcp_handshake = start_tcp.elapsed().as_secs_f64() * 1000.0;

    // Measure time to receive the response
    let start_response = Instant::now();
    let status = response.status();
    let headers = response.headers().clone();
    let body_bytes = response.bytes()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;
    metrics.response_time = start_response.elapsed().as_secs_f64() * 1000.0;
    let start_process = Instant::now();

    // Convert headers to KeyValue
    let headers: Vec<KeyValue> = headers
        .iter()
        .map(|(key, value)| {
            KeyValue {
                key: key.to_string(),
                value: String::from_utf8_lossy(value.as_bytes()).to_string(),
                enabled: true,
            }
        })
        .collect();

    let body_str = String::from_utf8_lossy(&body_bytes).to_string();
    
    // Create response object
    let response_data = ResponseData {
        id: request_data.id.clone(),
        timestamp: chrono::Utc::now().timestamp_millis() as u64,
        status: status.as_u16(),
        status_text: status.canonical_reason().unwrap_or("").to_string(),
        headers: Some(headers),
        data: Some(body_str),
        time: start_time.elapsed().as_secs_f64() * 1000.0,
        size: body_bytes.len(),
    };

    metrics.process = start_process.elapsed().as_secs_f64() * 1000.0;

    // Create debug information
    let debug = vec![
        KeyValue {
            key: "Postier UID".to_string(),
            value: request_data.id.clone(),
            enabled: true,
        },
        KeyValue {
            key: "Request time".to_string(),
            value: format!("{}ms", response_data.time),
            enabled: true,
        },
        KeyValue {
            key: "Request url".to_string(),
            value: url.clone(),
            enabled: true,
        },
        KeyValue {
            key: "Response status".to_string(),
            value: format!("{} ({})", response_data.status, response_data.status_text),
            enabled: true,
        },
        KeyValue {
            key: "Response body".to_string(),
            value: format!("blob size: {} bytes", response_data.size),
            enabled: true,
        },
        // detailed metrics
        KeyValue {
            key: "Prepare".to_string(),
            value: format!("{:.2}ms", metrics.prepare),
            enabled: true,
        },
        KeyValue {
            key: "DNS Lookup".to_string(),
            value: format!("{:.2}ms", metrics.dns_lookup),
            enabled: true,
        },
        KeyValue {
            key: "TCP Handshake".to_string(),
            value: format!("{:.2}ms", metrics.tcp_handshake),
            enabled: true,
        },
        KeyValue {
            key: "Response Time".to_string(),
            value: format!("{:.2}ms", metrics.response_time),
            enabled: true,
        },
        KeyValue {
            key: "Process Time".to_string(),
            value: format!("{:.2}ms", metrics.process),
            enabled: true,
        },
    ];
    
    Ok(PostierObject {
        request: request_data,
        response: response_data,
        debug,
        metrics,
    })
} 