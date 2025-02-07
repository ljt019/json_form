use crate::AppData;
use serde::Serialize;
use serde_json::Value as Json;
use std::collections::HashMap;
use std::fs;
use std::io::Read;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

use crate::OUTPUT_FOLDER_PATH;

use crate::models::{
    FullConfigFile, NewSwitchSubmission, PlaneSwitchData, SoundEffect, SwitchData, SwitchType,
};

#[derive(Serialize)]
pub struct PlaneConfigFile {
    pub file_name: String,
    pub model_path: String,
}

#[tauri::command]
pub fn load_existing_plane_config_files(app_handle: tauri::AppHandle) -> Vec<PlaneConfigFile> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    // Return an empty vector if the directory doesn't exist.
    if !plane_config_folder_path.exists() {
        return Vec::new();
    }

    // Read the directory entries.
    let entries = fs::read_dir(plane_config_folder_path).expect("Failed to read directory");

    let mut plane_configs = Vec::new();

    for entry in entries.filter_map(Result::ok) {
        let path: std::path::PathBuf = entry.path();
        if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
            // Get the file name.
            let file_name = path.file_name().unwrap().to_string_lossy().into_owned();

            // Read and parse the JSON file to extract the modelPath.
            let mut file_content = String::new();
            if let Ok(mut file) = fs::File::open(&path) {
                if file.read_to_string(&mut file_content).is_ok() {
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&file_content) {
                        let model_path = json
                            .get("modelPath")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();

                        plane_configs.push(PlaneConfigFile {
                            file_name,
                            model_path,
                        });
                    }
                }
            }
        }
    }

    plane_configs
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
pub fn create_new_config_file(
    app_handle: tauri::AppHandle,
    plane_name: String,
    model_file_path: String,
) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);

    // Create the directory if it doesn't exist
    std::fs::create_dir_all(&plane_config_folder_path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    // Create the full file path
    let file_path = plane_config_folder_path.join(format!("{}.json", plane_name));

    // Build the JSON structure with the provided planeName, modelPath, and an empty "switches" object.
    let initial_content = serde_json::json!({
        "planeName": plane_name,
        "modelPath": model_file_path,
        "switches": {}
    });

    // Convert the JSON object into a pretty-printed string
    let file_content = serde_json::to_string_pretty(&initial_content)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

    // Write the JSON string to the file
    std::fs::write(&file_path, file_content)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_current_file_contents(app_handle: tauri::AppHandle) -> Result<String, String> {
    let state = app_handle.state::<std::sync::Mutex<crate::AppData>>();
    let state = state.lock().unwrap();

    let current_json_file_name = state.current_json_file.clone();

    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Couldn't find app_data_dir");

    let plane_config_folder_path = app_data_dir.join(crate::OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(current_json_file_name);

    // Read the file contents
    let file_contents = fs::read_to_string(current_json_file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    // Parse the JSON contents into our FullConfigFile struct
    let config_file: FullConfigFile =
        serde_json::from_str(&file_contents).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    // Serialize the struct back to a JSON string
    let json_output = serde_json::to_string_pretty(&config_file)
        .map_err(|e| format!("Failed to serialize to JSON: {}", e))?;

    Ok(json_output)
}

#[tauri::command]
pub fn open_file(path: String) -> Result<Vec<u8>, String> {
    println!("{}", &path);
    fs::read(PathBuf::from(path)).map_err(|e| e.to_string())
}

/*

JSON FILE EXAMPLE
-------------------

{
  "planeName": "b-52",
  "modelPath": "/home/models/b52.glb",
  "switches": {
    "Lever1": {
      "switchType": "lever",
      "switchDescription": "Air Pressure Switch ",
      "movementAxis": "Y",
      "soundEffect": "leverSound",
      "movementMode": true,
      "momentarySwitch": false,
      "bleedMargins": 0.3,
      "defaultPosition": 0.0,
      "upperLimit": 90.0,
      "lowerLimit": 0.0
    },
    "Dial2": {
      "switchType": "dial",
      "switchDescription": "A lever description I just wrote",
      "movementAxis": "Z",
      "soundEffect": "dialSound",
      "movementMode": false,
      "momentarySwitch": true,
      "bleedMargins": 0.25,
      "defaultPosition": 25.0,
      "upperLimit": 75.0,
      "lowerLimit": 0.0
    }
  }
}

*/
