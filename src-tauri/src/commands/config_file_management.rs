use crate::AppData;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

use crate::OUTPUT_FOLDER_PATH;

use crate::models::FullConfigFile;

#[tauri::command]
pub fn create_new_config_file(
    app_handle: tauri::AppHandle,
    plane_name: String,
    model_file_path: String,
) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    // Create the directory if it doesn't exist
    std::fs::create_dir_all(&plane_config_folder_path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    // Create the full file path
    let file_path = plane_config_folder_path.join(format!("{}.json", plane_name));

    // Build the JSON structure with the provided planeName, modelPath, and an empty "switches" object.
    let initial_content = serde_json::json!({
        "planeName": plane_name,
        "modelPath": model_file_path,
        "switches": {}
    });

    // Convert the JSON object into a pretty-printed string
    let file_content = serde_json::to_string_pretty(&initial_content)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

    // Write the JSON string to the file
    std::fs::write(&file_path, file_content)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_current_config_file(app_handle: tauri::AppHandle) -> String {
    let state = app_handle.state::<Mutex<AppData>>();

    let state = state.lock().unwrap();

    return state.current_json_file.clone();
}

#[tauri::command]
pub fn set_current_config_file(app_handle: tauri::AppHandle, file_name: String) {
    println!("Setting current file to: {:?}", &file_name);

    let state = app_handle.state::<Mutex<AppData>>();

    let mut state = state.lock().unwrap();

    state.current_json_file = file_name;
}

#[tauri::command]
pub fn get_current_config_file_contents(app_handle: tauri::AppHandle) -> Result<String, String> {
    let state = app_handle.state::<std::sync::Mutex<crate::AppData>>();
    let state = state.lock().unwrap();

    let current_json_file_name = state.current_json_file.clone();

    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(crate::OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(current_json_file_name);

    // Read the file contents
    let file_contents = fs::read_to_string(current_json_file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    // Parse the JSON contents into our FullConfigFile struct
    let config_file: FullConfigFile =
        serde_json::from_str(&file_contents).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    // Serialize the struct back to a JSON string
    let json_output = serde_json::to_string_pretty(&config_file)
        .map_err(|e| format!("Failed to serialize to JSON: {}", e))?;

    Ok(json_output)
}

#[tauri::command]
pub fn open_file(path: String) -> Result<Vec<u8>, String> {
    println!("{}", &path);
    fs::read(PathBuf::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_plane_config_folder(app_handle: tauri::AppHandle) {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    app_handle
        .opener()
        .open_path(
            plane_config_folder_path
                .to_str()
                .expect("Couldn't open path"),
            None::<&str>,
        )
        .expect("coudln't open path");
}
