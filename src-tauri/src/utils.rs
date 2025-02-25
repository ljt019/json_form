use serde::{Deserialize, Serialize};
use serde_json::Value as Json;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

/// Get the current configuration file name from app state
pub fn get_current_file_name(app_handle: &AppHandle) -> Result<String, String> {
    let state = app_handle.state::<std::sync::Mutex<crate::AppData>>();
    let state = state.lock().unwrap();
    let file_name = state.current_json_file.clone();

    if file_name.is_empty() {
        return Err("No configuration file is currently selected".to_string());
    }

    Ok(file_name)
}

/// Build the path to the configuration file
pub fn build_config_file_path(app_handle: &AppHandle, file_name: &str) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|_| "Couldn't find app data directory".to_string())?;

    let config_folder_path = app_data_dir.join(crate::OUTPUT_FOLDER_PATH);

    // Ensure the config directory exists
    if !config_folder_path.exists() {
        std::fs::create_dir_all(&config_folder_path)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    Ok(config_folder_path.join(file_name))
}

/// Load and parse a JSON file
pub fn load_json_file(file_path: &std::path::Path) -> Result<Json, String> {
    use serde_json::json;

    if !file_path.exists() {
        return Ok(json!({}));
    }

    let file_content = std::fs::read_to_string(file_path)
        .map_err(|e| format!("Failed to read JSON file: {}", e))?;

    if file_content.trim().is_empty() {
        return Ok(json!({}));
    }

    serde_json::from_str(&file_content).map_err(|e| format!("Failed to parse JSON content: {}", e))
}

/// Ensure a section exists in the JSON data and return a mutable reference to it
pub fn ensure_section_exists<'a>(
    json_data: &'a mut Json,
    section_name: &str,
) -> Result<&'a mut Json, String> {
    use serde_json::json;

    if !json_data.is_object() {
        return Err("Invalid JSON structure: expected an object at the root".to_string());
    }

    let section = json_data
        .as_object_mut()
        .unwrap()
        .entry(section_name)
        .or_insert(json!({}));

    if !section.is_object() {
        return Err(format!(
            "Invalid JSON structure: expected '{}' to be an object",
            section_name
        ));
    }

    Ok(section)
}

/// Save JSON data to a file with pretty formatting
pub fn save_json_file(file_path: &std::path::Path, json_data: &Json) -> Result<(), String> {
    let updated_json = serde_json::to_string_pretty(json_data)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

    std::fs::write(file_path, updated_json).map_err(|e| format!("Failed to write JSON file: {}", e))
}

/// Deserialize JSON value to a specific type
pub fn deserialize_json<T: for<'de> Deserialize<'de>>(json_value: Json) -> Result<T, String> {
    serde_json::from_value(json_value).map_err(|e| format!("Failed to deserialize JSON: {}", e))
}

/// Serialize a value to JSON
pub fn serialize_to_json<T: Serialize>(value: &T) -> Result<Json, String> {
    serde_json::to_value(value).map_err(|e| format!("Failed to serialize to JSON: {}", e))
}

/// Get the current configuration file and load its JSON content
pub fn get_current_config(app_handle: &AppHandle) -> Result<(String, PathBuf, Json), String> {
    let current_file = get_current_file_name(app_handle)?;
    let file_path = build_config_file_path(app_handle, &current_file)?;
    let json_data = load_json_file(&file_path)?;

    Ok((current_file, file_path, json_data))
}
