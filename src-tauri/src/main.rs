// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;

use commands::*;
use tauri::Manager;

use std::sync::Mutex;

pub const OUTPUT_FOLDER_PATH: &str = "plane_configs";

fn setup_plane_config_folder(app: &mut tauri::App) {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    std::fs::create_dir_all(&plane_config_folder_path)
        .expect("Failed to create app data directory");
}

struct AppData {
    current_json_file: String,
}

#[tauri::command]
fn set_current_json_file(app_handle: tauri::AppHandle, file_name: String) {
    println!("Setting current file to: {:?}", &file_name);

    let state = app_handle.state::<Mutex<AppData>>();

    let mut state = state.lock().unwrap();

    state.current_json_file = file_name;
}

#[tauri::command]
fn get_current_json_file(app_handle: tauri::AppHandle) -> String {
    let state = app_handle.state::<Mutex<AppData>>();

    let state = state.lock().unwrap();

    return state.current_json_file.clone();
}

#[tauri::command]
fn create_new_file(app_handle: tauri::AppHandle, file_name: String) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    // Create the directory if it doesn't exist
    std::fs::create_dir_all(&plane_config_folder_path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    // Ensure the file name ends with .json
    let file_name = if !file_name.ends_with(".json") {
        format!("{}.json", file_name)
    } else {
        file_name
    };

    // Create the full file path
    let file_path = plane_config_folder_path.join(file_name);

    // Create an empty JSON object as initial content
    let initial_content = "{}";

    // Write the file
    std::fs::write(&file_path, initial_content)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_new_switch,
            open_plane_config_folder,
            load_existing_plane_config_files,
            set_current_json_file,
            get_current_json_file,
            create_new_file,
        ])
        .setup(|app| {
            setup_plane_config_folder(app);

            app.manage(Mutex::new(AppData {
                current_json_file: "".to_string(),
            }));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
