use serde_json::Value as Json;
use tauri::Manager;

use crate::models::{NewSwitchSubmission, SoundEffect, SwitchData, SwitchType};
use crate::OUTPUT_FOLDER_PATH;

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
        .map_err(|_| "Couldn't find app_data_dir".to_string())?;
    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(current_json_file_name.clone());

    println!("{:?}", current_json_file_name);
    println!("{:?}", &form_data);

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

    // Ensure the root is an object.
    if !json_data.is_object() {
        return Err("Invalid JSON structure: expected an object at the root".to_string());
    }

    // Get (or create) the "switches" object within the root.
    let switches = json_data
        .as_object_mut()
        .unwrap()
        .entry("switches")
        .or_insert(json!({}));
    if !switches.is_object() {
        return Err("Invalid JSON structure: expected 'switches' to be an object".to_string());
    }

    // Check if form_data is an array (batched request) or a single object.
    if form_data.is_array() {
        let submissions: Vec<NewSwitchSubmission> = serde_json::from_value(form_data)
            .map_err(|e| format!("Failed to deserialize batched JSON: {}", e))?;
        for submission in submissions {
            process_single_switch(&submission, switches)?;
        }
    } else {
        let submission: NewSwitchSubmission = serde_json::from_value(form_data)
            .map_err(|e| format!("Failed to deserialize JSON: {}", e))?;
        process_single_switch(&submission, switches)?;
    }

    // Serialize the updated JSON with pretty formatting and write it back to the file.
    let updated_json = serde_json::to_string_pretty(&json_data)
        .map_err(|e| format!("Failed to serialize updated JSON: {}", e))?;
    std::fs::write(&current_json_file_path, updated_json)
        .map_err(|e| format!("Failed to write JSON file: {}", e))?;

    Ok("Switch added/updated successfully".to_string())
}

fn process_single_switch(
    submission: &NewSwitchSubmission,
    switches: &mut serde_json::Value,
) -> Result<(), String> {
    // Determine the appropriate sound effect based on switch type.
    let sound_effect = match submission.switch_type.clone() {
        SwitchType::Lever => SoundEffect::LeverSound,
        SwitchType::Button => SoundEffect::ButtonSound,
        SwitchType::Dial => SoundEffect::DialSound,
        SwitchType::Throttle => SoundEffect::ThrottleSound,
    };

    let switch_data = SwitchData {
        // Clone the non-Copy fields to avoid moving out of the submission.
        switch_type: submission.switch_type.clone(),
        switch_description: submission.switch_description.clone(),
        movement_axis: submission.movement_axis.clone(),
        movement_mode: submission.movement_mode,
        momentary_switch: submission.momentary_switch,
        bleed_margins: submission.bleed_margins,
        default_position: submission.default_position,
        upper_limit: submission.upper_limit,
        lower_limit: submission.lower_limit,
        sound_effect,
        raw_node_name: submission.raw_node_name.clone(), // Add the raw node name field
    };

    // Serialize the new switch data to a JSON value.
    let new_switch_value = serde_json::to_value(&switch_data)
        .map_err(|e| format!("Failed to serialize switch data: {}", e))?;
    // Insert or update the switch entry (overwriting if the name already exists).
    switches
        .as_object_mut()
        .unwrap()
        .insert(submission.switch_name.clone(), new_switch_value);
    Ok(())
}
