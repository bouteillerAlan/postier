use serde::{Deserialize, Serialize};
use tauri::plugin::TauriPlugin;
use tauri::Runtime;

mod client;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpMetrics {
    pub prepare: f64,        // request preparation time
    pub socket_init: f64,    // socket initialization time
    pub dns_lookup: f64,     // dns resolution time
    pub tcp_handshake: f64,  // tcp handshake time
    pub transfer_start: f64, // transfer start time
    pub download: f64,       // download time
    pub process: f64,        // process time
    pub total: f64,          // total time
}

// types that correspond to the ts types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    HEAD,
    OPTIONS,
    PATCH,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ContentType {
    #[serde(rename = "form-data")]
    FormData,
    #[serde(rename = "text")]
    Text,
    #[serde(rename = "javascript")]
    JavaScript,
    #[serde(rename = "json")]
    Json,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "xml")]
    Xml,
    #[serde(rename = "none")]
    None,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyValue {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestData {
    pub id: String,
    pub timestamp: u64,
    pub url: String,
    pub composed_url: String,
    pub method: HttpMethod,
    pub headers: Option<Vec<KeyValue>>,
    pub query: Option<Vec<KeyValue>>,
    pub content_type: Option<ContentType>,
    pub body: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseData {
    pub id: String,
    pub timestamp: u64,
    pub status: u16,
    pub status_text: String,
    pub headers: Option<Vec<KeyValue>>,
    pub data: Option<String>,
    pub time: f64,
    pub size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostierObject {
    pub request: RequestData,
    pub response: ResponseData,
    pub debug: Vec<KeyValue>,
    pub metrics: HttpMetrics,
}

#[tauri::command]
pub async fn send_request_with_metrics(request_data: RequestData) -> Result<PostierObject, String> {
    client::send_request(request_data).await
}

// tauri plugin
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    tauri::plugin::Builder::new("http_metrics")
        .invoke_handler(tauri::generate_handler![send_request_with_metrics])
        .build()
} 