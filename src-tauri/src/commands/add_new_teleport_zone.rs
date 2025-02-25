use serde_json::Value as Json;
use crate::models::NewTeleportZoneSubmission;
use crate::utils;

#[tauri::command]
pub fn add_new_teleport_zone(
    app_handle: tauri::AppHandle,
    form_data: Json,
) -> Result<String, String> {
    use serde_json::json;

    println!("Adding teleport zone: {:?}", &form_data);

    // Get current config file info
    let (_, file_path, mut json_data) = utils::get_current_config(&app_handle)?;

    // Ensure teleportZones section exists
    let teleport_zones = utils::ensure_section_exists(&mut json_data, "teleportZones")?;

    // Deserialize submission (only one zone at a time)
    let submission: NewTeleportZoneSubmission = utils::deserialize_json(form_data)?;

    // Insert or update the teleport zone by name
    let new_zone = json!({
        "x": submission.x,
        "y": submission.y,
        "z": submission.z,
    });
    
    teleport_zones
        .as_object_mut()
        .unwrap()
        .insert(submission.teleport_zone_name, new_zone);

    // Save the updated JSON
    utils::save_json_file(&file_path, &json_data)?;

    Ok("Teleport zone added/updated successfully".to_string())
}
