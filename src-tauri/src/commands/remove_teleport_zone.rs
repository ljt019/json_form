use crate::models::NewTeleportZoneSubmission;
use crate::OUTPUT_FOLDER_PATH;
use serde_json::Value as Json;
use tauri::Manager;

#[tauri::command]
pub fn remove_teleport_zone(
    app_handle: tauri::AppHandle,
    teleport_zone_key: String,
) -> Result<(), String> {
    use serde_json::json;
    // grab app state for current file name
    let state = app_handle.state::<std::sync::Mutex<crate::AppData>>();
    let state = state.lock().unwrap();
    let current_json_file_name = state.current_json_file.clone();

    // construct file path
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|_| "couldn't find app_data_dir".to_string())?;
    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(current_json_file_name.clone());

    println!("{:?}", current_json_file_name);

    // ensure directory exists
    if !plane_config_folder_path.exists() {
        std::fs::create_dir_all(&plane_config_folder_path)
            .map_err(|e| format!("failed to create config directory: {}", e))?;
    }

    // load existing json
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

    // ensure root is object
    if !json_data.is_object() {
        return Err("invalid json structure: expected an object at the root".to_string());
    }

    // get or create "teleportZones" object
    let teleport_zones = json_data
        .as_object_mut()
        .unwrap()
        .entry("teleportZones")
        .or_insert(json!({}));

    if !teleport_zones.is_object() {
        return Err("invalid json structure: expected 'teleportZones' to be an object".to_string());
    }

    // Remove teleport zone with that key from json
    let teleport_zones_obj = teleport_zones.as_object_mut().unwrap();
    teleport_zones_obj.remove(&teleport_zone_key);

    // Write updated json back to file
    std::fs::write(
        &current_json_file_path,
        serde_json::to_string_pretty(&json_data)
            .map_err(|e| format!("failed to serialize json: {}", e))?,
    )
    .map_err(|e| format!("failed to write json file: {}", e))?;

    Ok(())
}
