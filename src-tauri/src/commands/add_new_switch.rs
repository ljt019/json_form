use serde_json::Value as Json;
use tauri::Manager;

use crate::OUTPUT_FOLDER_PATH;

use crate::models::{NewSwitchSubmission, SoundEffect, SwitchData, SwitchType};

#[tauri::command]
pub fn add_new_switch(app_handle: tauri::AppHandle, form_data: Json) -> Result<String, String> {
    use serde_json::json;

    // Get app state to determine the current file name
    let state = app_handle.state::<std::sync::Mutex<crate::AppData>>();
    let state = state.lock().unwrap();
    let current_json_file_name = state.current_json_file.clone();

    // Get the app data directory and construct the file path
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");
    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(current_json_file_name.clone());

    println!("{:?}", current_json_file_name);
    println!("{:?}", &form_data);

    // Deserialize the incoming form data into our expected structure
    let plane_input: NewSwitchSubmission = serde_json::from_value(form_data)
        .map_err(|e| format!("Failed to deserialize JSON: {}", e))?;

    // Determine the appropriate sound effect based on switch type
    let sound_effect = match plane_input.switch_type {
        SwitchType::Lever => SoundEffect::LeverSound,
        SwitchType::Button => SoundEffect::ButtonSound,
        SwitchType::Dial => SoundEffect::DialSound,
        SwitchType::Throttle => SoundEffect::ThrottleSound,
    };

    // Build the complete switch data structure
    let plane_form = SwitchData {
        switch_type: plane_input.switch_type,
        switch_description: plane_input.switch_description,
        movement_axis: plane_input.movement_axis,
        movement_mode: plane_input.movement_mode,
        momentary_switch: plane_input.momentary_switch,
        bleed_margins: plane_input.bleed_margins,
        default_position: plane_input.default_position,
        upper_limit: plane_input.upper_limit,
        lower_limit: plane_input.lower_limit,
        sound_effect,
    };

    // Ensure the directory exists (creates it if it doesn't)
    if !plane_config_folder_path.exists() {
        std::fs::create_dir_all(&plane_config_folder_path)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    // Read and parse the existing JSON file into a serde_json::Value so that we can preserve all keys.
    let mut json_data: serde_json::Value = if current_json_file_path.exists() {
        let file_content = std::fs::read_to_string(&current_json_file_path)
            .map_err(|e| format!("Failed to read JSON file: {}", e))?;
        if file_content.trim().is_empty() {
            json!({})
        } else {
            serde_json::from_str(&file_content).unwrap_or_else(|_| json!({}))
        }
    } else {
        json!({})
    };

    // Make sure the root is an object
    if !json_data.is_object() {
        return Err("Invalid JSON structure: expected an object at the root".to_string());
    }

    // Get (or create) the "switches" object within the root
    let switches = json_data
        .as_object_mut()
        .unwrap()
        .entry("switches")
        .or_insert(json!({}));

    if !switches.is_object() {
        return Err("Invalid JSON structure: expected 'switches' to be an object".to_string());
    }

    // Serialize the new switch data to a JSON value
    let new_switch_value = serde_json::to_value(&plane_form)
        .map_err(|e| format!("Failed to serialize switch data: {}", e))?;
    // Insert or update the switch entry (overwriting if the name already exists)
    switches
        .as_object_mut()
        .unwrap()
        .insert(plane_input.switch_name, new_switch_value);

    // Serialize the updated JSON with pretty formatting and write it back to the file
    let updated_json = serde_json::to_string_pretty(&json_data)
        .map_err(|e| format!("Failed to serialize updated JSON: {}", e))?;
    std::fs::write(&current_json_file_path, updated_json)
        .map_err(|e| format!("Failed to write JSON file: {}", e))?;

    Ok("Switch added/updated successfully".to_string())
}
