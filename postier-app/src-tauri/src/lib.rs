// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod http_metrics;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(http_metrics::init())
        .invoke_handler(tauri::generate_handler![http_metrics::send_request_with_metrics])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
