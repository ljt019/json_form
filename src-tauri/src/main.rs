// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::Local;
use serde::{Deserialize, Serialize};
use serde_json::Value as Json;
use std::env;
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PlaneFormInput {
    switch_type: SwitchType,
    switch_name: String,
    switch_description: String,
    movement_axis: MovementAxis,
    movement_mode: bool,
    momentary_switch: bool,
    bleed_margins: f32,
    default_position: f32,
    upper_limit: f32,
    lower_limit: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum SwitchType {
    Lever,
    Button,
    Dial,
    Throttle,
}

#[derive(Debug, Serialize, Deserialize)]
enum MovementAxis {
    X,
    Y,
    Z,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
enum SoundEffect {
    LeverSound,
    ButtonSound,
    DialSound,
    ThrottleSound,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PlaneFormData {
    switch_type: SwitchType,
    switch_name: String,
    switch_description: String,
    movement_axis: MovementAxis,
    sound_effect: SoundEffect,
    movement_mode: bool,
    momentary_switch: bool,
    bleed_margins: f32,
    default_position: f32,
    upper_limit: f32,
    lower_limit: f32,
}

#[tauri::command]
fn save_json_file(form_data: Json) -> Result<String, String> {
    println!("{:?}", &form_data);

    // Deserialize the JSON into the PlaneFormInput struct
    let plane_input: PlaneFormInput = serde_json::from_value(form_data)
        .map_err(|e| format!("Failed to deserialize JSON: {}", e))?;

    let sound_effect = match plane_input.switch_type {
        SwitchType::Lever => SoundEffect::LeverSound,
        SwitchType::Button => SoundEffect::ButtonSound,
        SwitchType::Dial => SoundEffect::DialSound,
        SwitchType::Throttle => SoundEffect::ThrottleSound,
    };

    // Create the complete PlaneFormData struct
    let plane_form = PlaneFormData {
        switch_type: plane_input.switch_type,
        switch_name: plane_input.switch_name,
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

    // Get the current executable's directory
    let current_exe_dir = env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?
        .parent()
        .ok_or("Failed to get parent directory")?
        .to_path_buf();

    // Generate timestamp for unique filename
    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("json_output_{}.json", timestamp);

    // Create the full file path
    let mut file_path = current_exe_dir;
    file_path.push(filename);

    let json_string = serde_json::to_string_pretty(&plane_form)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

    // Write the file
    fs::write(&file_path, json_string).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(file_path.to_string_lossy().into_owned())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_json_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
