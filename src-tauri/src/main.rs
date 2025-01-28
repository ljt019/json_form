// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::Local;
use serde_json::Value as Json;
use std::env;
use std::fs;

#[tauri::command]
fn save_json_file(form_data: Json) -> Result<String, String> {
    // Get the current executable's directory
    let current_exe_dir = env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?
        .parent()
        .ok_or("Failed to get parent directory")?
        .to_path_buf();

    // Generate timestamp for unique filename
    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("json_output_{}.json", timestamp);

    // Create the full file path
    let mut file_path = current_exe_dir;
    file_path.push(filename);

    // Convert the JSON to a pretty-printed string
    let json_string = serde_json::to_string_pretty(&form_data)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

    // Write the file
    fs::write(&file_path, json_string).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(file_path.to_string_lossy().into_owned())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_json_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
