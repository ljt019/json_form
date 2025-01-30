use crate::AppData;
use serde_json::Value as Json;
use std::collections::HashMap;
use std::fs;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

use crate::OUTPUT_FOLDER_PATH;

use crate::models::{NewSwitchSubmission, PlaneSwitchData, SoundEffect, SwitchData, SwitchType};

#[tauri::command]
pub fn load_existing_plane_config_files(app_handle: tauri::AppHandle) -> Vec<String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    // Check if the directory exists and early return with an empty vector if it doesn't
    if !plane_config_folder_path.exists() {
        return Vec::new();
    }

    // Read the directory entries
    let entries = fs::read_dir(plane_config_folder_path).expect("Failed to read directory");

    // Filter out the .json files and collect their names
    let json_files: Vec<String> = entries
        .filter_map(|entry| {
            let entry = entry.expect("Failed to read entry");
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
                Some(path.file_name().unwrap().to_string_lossy().into_owned())
            } else {
                None
            }
        })
        .collect();

    json_files
}

#[tauri::command]
pub fn open_plane_config_folder(app_handle: tauri::AppHandle) {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    app_handle
        .opener()
        .open_path(
            plane_config_folder_path
                .to_str()
                .expect("Couldn't open path"),
            None::<&str>,
        )
        .expect("coudln't open path");
}

#[tauri::command]
pub fn add_new_switch(app_handle: tauri::AppHandle, form_data: Json) -> Result<String, String> {
    let state = app_handle.state::<std::sync::Mutex<crate::AppData>>();
    let state = state.lock().unwrap();

    let current_json_file_name = state.current_json_file.clone();

    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(current_json_file_name.clone());

    println!("{:?}", current_json_file_name);
    println!("{:?}", &form_data);

    // Deserialize the JSON into the NewSwitchSubmission struct
    let plane_input: NewSwitchSubmission = serde_json::from_value(form_data)
        .map_err(|e| format!("Failed to deserialize JSON: {}", e))?;

    // Determine the sound effect based on the switch type
    let sound_effect = match plane_input.switch_type {
        SwitchType::Lever => SoundEffect::LeverSound,
        SwitchType::Button => SoundEffect::ButtonSound,
        SwitchType::Dial => SoundEffect::DialSound,
        SwitchType::Throttle => SoundEffect::ThrottleSound,
    };

    // Create the complete SwitchData struct
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

    // Read and parse the existing JSON file, or create new data structure if file is empty or invalid
    let mut existing_data: PlaneSwitchData = if current_json_file_path.exists() {
        let file_content = std::fs::read_to_string(&current_json_file_path)
            .map_err(|e| format!("Failed to read JSON file: {}", e))?;

        if file_content.trim().is_empty() {
            // Handle empty file
            PlaneSwitchData {
                switches: HashMap::new(),
            }
        } else {
            // Try to parse existing content
            serde_json::from_str(&file_content).unwrap_or_else(|_| {
                // If parsing fails, return new empty structure
                PlaneSwitchData {
                    switches: HashMap::new(),
                }
            })
        }
    } else {
        // File doesn't exist, create new structure
        PlaneSwitchData {
            switches: HashMap::new(),
        }
    };

    // Update or add the new switch data
    existing_data
        .switches
        .insert(plane_input.switch_name, plane_form);

    // Create the directory if it doesn't exist
    if !plane_config_folder_path.exists() {
        std::fs::create_dir_all(&plane_config_folder_path)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    // Serialize the updated data back to JSON
    let updated_json = serde_json::to_string_pretty(&existing_data)
        .map_err(|e| format!("Failed to serialize updated JSON: {}", e))?;

    // Write the updated JSON back to the file
    std::fs::write(&current_json_file_path, updated_json)
        .map_err(|e| format!("Failed to write JSON file: {}", e))?;

    Ok("Switch added/updated successfully".to_string())
}

#[tauri::command]
pub fn set_current_json_file(app_handle: tauri::AppHandle, file_name: String) {
    println!("Setting current file to: {:?}", &file_name);

    let state = app_handle.state::<Mutex<AppData>>();

    let mut state = state.lock().unwrap();

    state.current_json_file = file_name;
}

#[tauri::command]
pub fn get_current_json_file(app_handle: tauri::AppHandle) -> String {
    let state = app_handle.state::<Mutex<AppData>>();

    let state = state.lock().unwrap();

    return state.current_json_file.clone();
}

#[tauri::command]
pub fn create_new_file(app_handle: tauri::AppHandle, file_name: String) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    // Create the directory if it doesn't exist
    std::fs::create_dir_all(&plane_config_folder_path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    // Ensure the file name ends with .json
    let file_name = if !file_name.ends_with(".json") {
        format!("{}.json", file_name)
    } else {
        file_name
    };

    // Create the full file path
    let file_path = plane_config_folder_path.join(file_name);

    // Create an empty JSON object as initial content
    let initial_content = "{}";

    // Write the file
    std::fs::write(&file_path, initial_content)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(())
}
