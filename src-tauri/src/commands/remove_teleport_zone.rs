use crate::utils;

#[tauri::command]
pub fn remove_teleport_zone(
    app_handle: tauri::AppHandle,
    teleport_zone_key: String,
) -> Result<String, String> {
    println!("Removing teleport zone: {}", teleport_zone_key);

    // Get current config file info
    let (_, file_path, mut json_data) = utils::get_current_config(&app_handle)?;

    // Ensure teleportZones section exists
    let teleport_zones = utils::ensure_section_exists(&mut json_data, "teleportZones")?;

    // Remove teleport zone with that key from json
    let teleport_zones_obj = teleport_zones.as_object_mut().unwrap();
    if !teleport_zones_obj.contains_key(&teleport_zone_key) {
        return Err(format!("Teleport zone '{}' not found", teleport_zone_key));
    }

    teleport_zones_obj.remove(&teleport_zone_key);

    // Save the updated JSON
    utils::save_json_file(&file_path, &json_data)?;

    Ok(format!(
        "Teleport zone '{}' removed successfully",
        teleport_zone_key
    ))
}
