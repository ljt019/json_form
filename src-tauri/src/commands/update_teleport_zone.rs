use crate::OUTPUT_FOLDER_PATH;
use serde_json::Value as Json;
use tauri::Manager;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct TeleportZoneUpdate {
    pub name: String,
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[tauri::command]
pub fn update_teleport_zone(
    app_handle: tauri::AppHandle,
    updated_zone: Json,
) -> Result<String, String> {
    use serde_json::json;

    // Grab app state for current file name
    let state = app_handle.state::<std::sync::Mutex<crate::AppData>>();
    let state = state.lock().unwrap();
    let current_json_file_name = state.current_json_file.clone();

    // Construct file path
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|_| "couldn't find app_data_dir".to_string())?;
    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(current_json_file_name.clone());

    println!("Updating teleport zone: {:?}", &updated_zone);

    // Ensure directory exists
    if !plane_config_folder_path.exists() {
        std::fs::create_dir_all(&plane_config_folder_path)
            .map_err(|e| format!("failed to create config directory: {}", e))?;
    }

    // Load existing json
    let mut json_data: serde_json::Value = if current_json_file_path.exists() {
        let file_content = std::fs::read_to_string(&current_json_file_path)
            .map_err(|e| format!("failed to read json file: {}", e))?;
        if file_content.trim().is_empty() {
            json!({})
        } else {
            serde_json::from_str(&file_content).unwrap_or_else(|_| json!({}))
        }
    } else {
        json!({})
    };

    // Ensure root is object
    if !json_data.is_object() {
        return Err("invalid json structure: expected an object at the root".to_string());
    }

    // Get "teleportZones" object
    let teleport_zones = json_data
        .as_object_mut()
        .unwrap()
        .entry("teleportZones")
        .or_insert(json!({}));
    if !teleport_zones.is_object() {
        return Err("invalid json structure: expected 'teleportZones' to be an object".to_string());
    }

    // Deserialize update submission
    let update: TeleportZoneUpdate = serde_json::from_value(updated_zone)
        .map_err(|e| format!("failed to deserialize json: {}", e))?;

    // Update the teleport zone
    if let Some(zone) = teleport_zones
        .as_object_mut()
        .unwrap()
        .get_mut(&update.name)
    {
        if let Some(zone_obj) = zone.as_object_mut() {
            zone_obj["x"] = json!(update.x);
            zone_obj["y"] = json!(update.y);
            zone_obj["z"] = json!(update.z);
        } else {
            return Err(format!("teleport zone '{}' is not an object", update.name));
        }
    } else {
        return Err(format!("teleport zone '{}' not found", update.name));
    }

    // Write back the updated json
    let updated_json = serde_json::to_string_pretty(&json_data)
        .map_err(|e| format!("failed to serialize updated json: {}", e))?;
    std::fs::write(&current_json_file_path, updated_json)
        .map_err(|e| format!("failed to write json file: {}", e))?;

    Ok(format!(
        "teleport zone '{}' updated successfully",
        update.name
    ))
}
