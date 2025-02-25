use crate::utils;
use serde::{Deserialize, Serialize};
use serde_json::Value as Json;

#[derive(Debug, Serialize, Deserialize)]
pub struct TeleportZoneUpdate {
    pub name: String,
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

// Regular update (only coordinates)
#[tauri::command]
pub fn update_teleport_zone(
    app_handle: tauri::AppHandle,
    updated_zone: Json,
) -> Result<String, String> {
    use serde_json::json;

    println!("Updating teleport zone: {:?}", &updated_zone);

    // Get current config file info
    let (_, file_path, mut json_data) = utils::get_current_config(&app_handle)?;

    // Ensure teleportZones section exists
    let teleport_zones = utils::ensure_section_exists(&mut json_data, "teleportZones")?;

    // Deserialize update submission
    let update: TeleportZoneUpdate = utils::deserialize_json(updated_zone)?;

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
            return Err(format!("Teleport zone '{}' is not an object", update.name));
        }
    } else {
        return Err(format!("Teleport zone '{}' not found", update.name));
    }

    // Save the updated JSON
    utils::save_json_file(&file_path, &json_data)?;

    Ok(format!(
        "Teleport zone '{}' updated successfully",
        update.name
    ))
}
