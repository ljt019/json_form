use std::fs;
use std::io::Read;
use tauri::Manager;

use crate::OUTPUT_FOLDER_PATH;

use crate::models::PlaneConfigFile;

#[tauri::command]
pub fn load_existing_plane_config_files(app_handle: tauri::AppHandle) -> Vec<PlaneConfigFile> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    // Return an empty vector if the directory doesn't exist.
    if !plane_config_folder_path.exists() {
        return Vec::new();
    }

    // Read the directory entries.
    let entries = fs::read_dir(plane_config_folder_path).expect("Failed to read directory");

    let mut plane_configs = Vec::new();

    for entry in entries.filter_map(Result::ok) {
        let path: std::path::PathBuf = entry.path();
        if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
            // Get the file name.
            let file_name = path.file_name().unwrap().to_string_lossy().into_owned();

            // Read and parse the JSON file to extract the modelPath.
            let mut file_content = String::new();
            if let Ok(mut file) = fs::File::open(&path) {
                if file.read_to_string(&mut file_content).is_ok() {
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&file_content) {
                        let model_path = json
                            .get("modelPath")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();

                        plane_configs.push(PlaneConfigFile {
                            file_name,
                            model_path,
                        });
                    }
                }
            }
        }
    }

    plane_configs
}
