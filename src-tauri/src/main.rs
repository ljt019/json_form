// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;

use commands::*;
use tauri::Manager;

use std::sync::Mutex;

pub const OUTPUT_FOLDER_PATH: &str = "plane_configs";

pub struct AppData {
    current_json_file: String,
}

fn setup_plane_config_folder(app: &mut tauri::App) {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    std::fs::create_dir_all(&plane_config_folder_path)
        .expect("Failed to create app data directory");
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_new_switch,
            add_new_teleport_zone,
            open_plane_config_folder,
            load_existing_plane_config_files,
            set_current_config_file,
            get_current_config_file,
            create_new_config_file,
            get_current_config_file_contents,
            open_file,
            load_plane_model_data
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
