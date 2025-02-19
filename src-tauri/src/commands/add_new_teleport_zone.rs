use serde_json::Value as Json;
use tauri::Manager;

use crate::models::NewTeleportZoneSubmission;
use crate::OUTPUT_FOLDER_PATH;

#[tauri::command]
pub fn add_new_teleport_zone(
    app_handle: tauri::AppHandle,
    form_data: Json,
) -> Result<String, String> {
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
    println!("{:?}", &form_data);

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

    // deserialize submission (only one zone at a time)
    let submission: NewTeleportZoneSubmission = serde_json::from_value(form_data)
        .map_err(|e| format!("failed to deserialize json: {}", e))?;

    // insert or update the teleport zone by name
    let new_zone = serde_json::json!({
        "x": submission.x,
        "y": submission.y,
        "z": submission.z,
    });
    teleport_zones
        .as_object_mut()
        .unwrap()
        .insert(submission.teleport_zone_name, new_zone);

    // write back the updated json
    let updated_json = serde_json::to_string_pretty(&json_data)
        .map_err(|e| format!("failed to serialize updated json: {}", e))?;
    std::fs::write(&current_json_file_path, updated_json)
        .map_err(|e| format!("failed to write json file: {}", e))?;

    Ok("teleport zone added/updated successfully".to_string())
}
