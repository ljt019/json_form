use crate::models::{NewSwitchSubmission, SoundEffect, SwitchData, SwitchType};
use crate::utils;
use serde_json::Value as Json;

#[tauri::command]
pub async fn add_new_switch(
    app_handle: tauri::AppHandle,
    form_data: Json,
) -> Result<String, String> {
    println!("Adding switch: {:?}", &form_data);

    // Get current config file info
    let (_, file_path, mut json_data) = utils::get_current_config(&app_handle)?;

    // Check for nonSwitchRawNodeNames first
    if !json_data
        .as_object()
        .unwrap()
        .contains_key("nonSwitchRawNodeNames")
    {
        let _ = crate::commands::load_plane_model_data::load_plane_model_data(app_handle.clone())
            .await?;
        json_data = utils::load_json_file(&file_path)?;
    }

    // Now get the switches section after potential update
    let switches = utils::ensure_section_exists(&mut json_data, "switches")?;

    // Process the form data
    if form_data.is_array() {
        let submissions: Vec<NewSwitchSubmission> = utils::deserialize_json(form_data)?;
        for submission in submissions {
            process_single_switch(&submission, switches)?;
        }
    } else {
        let submission: NewSwitchSubmission = utils::deserialize_json(form_data)?;
        process_single_switch(&submission, switches)?;
    }

    // Save the updated JSON
    utils::save_json_file(&file_path, &json_data)?;

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
        raw_node_name: submission.raw_node_name.clone(),
    };

    // Serialize and insert the new switch data
    let new_switch_value = utils::serialize_to_json(&switch_data)?;

    // Insert or update the switch entry
    switches
        .as_object_mut()
        .unwrap()
        .insert(submission.switch_name.clone(), new_switch_value);

    Ok(())
}
