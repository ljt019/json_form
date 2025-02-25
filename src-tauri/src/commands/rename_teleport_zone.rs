use super::update_teleport_zone::TeleportZoneUpdate;
use crate::utils;
use serde::{Deserialize, Serialize};
use serde_json::Value as Json;

#[derive(Debug, Serialize, Deserialize)]
struct TeleportZoneRename {
    pub old_name: String,
    pub name: String,
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[tauri::command]
pub fn rename_teleport_zone(
    app_handle: tauri::AppHandle,
    old_name: String,
    updated_zone: Json,
) -> Result<String, String> {
    use serde_json::{json, Map, Value};

    println!(
        "Renaming teleport zone from '{}': {:?}",
        &old_name, &updated_zone
    );

    // Get current config file info
    let (_, file_path, mut json_data) = utils::get_current_config(&app_handle)?;

    // Ensure teleportZones section exists
    let teleport_zones = utils::ensure_section_exists(&mut json_data, "teleportZones")?;
    let teleport_zones_obj = teleport_zones.as_object_mut().unwrap();

    // Deserialize update submission
    let update: TeleportZoneUpdate = utils::deserialize_json(updated_zone)?;

    // Check if old zone exists
    if !teleport_zones_obj.contains_key(&old_name) {
        return Err(format!("Teleport zone '{}' not found", old_name));
    }

    // Check if new name would cause a conflict
    if old_name != update.name && teleport_zones_obj.contains_key(&update.name) {
        return Err(format!("Teleport zone '{}' already exists", update.name));
    }

    // Get the old zone value
    let _old_zone = teleport_zones_obj.remove(&old_name).unwrap();

    // Create a new zone with updated properties
    let mut new_zone = Map::new();
    new_zone.insert("x".to_string(), json!(update.x));
    new_zone.insert("y".to_string(), json!(update.y));
    new_zone.insert("z".to_string(), json!(update.z));

    // Insert the new zone with the new name
    teleport_zones_obj.insert(update.name.clone(), Value::Object(new_zone));

    // Save the updated JSON
    utils::save_json_file(&file_path, &json_data)?;

    Ok(format!(
        "Teleport zone renamed from '{}' to '{}' successfully",
        old_name, update.name
    ))
}
