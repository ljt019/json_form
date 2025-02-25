use crate::models::{ParsedGLBData, SwitchItem};
use crate::AppData;
use crate::OUTPUT_FOLDER_PATH;
use base64::Engine;
use gltf;
use regex::Regex;
use std::collections::HashSet;
use std::fs;
use std::sync::Mutex;
use tauri::Manager;

fn traverse_node(
    node: gltf::Node,
    tags: &[&str],
    switches: &mut Vec<SwitchItem>,
    configured_switches: &HashSet<String>,
    depth: usize,
) {
    if let Some(name) = node.name() {
        for tag in tags {
            let pattern = format!("(?i){}", regex::escape(tag));
            let re = Regex::new(&pattern).expect("Failed to compile regex pattern");
            if re.is_match(name) {
                // Store the original, unmodified node name
                let raw_node_name = name.to_string();

                // Create the pretty name by removing tag and "-Collider"
                let mut pretty_name = re.replace_all(name, "").to_string();
                pretty_name = pretty_name.replace("-Collider", "");
                pretty_name = pretty_name.trim().to_string();

                // Check if this switch is already configured
                let is_configured = configured_switches.contains(&pretty_name);

                // Get switch type from the tag
                let switch_type = tag.trim_start_matches('-').to_lowercase();

                // Create the SwitchItem, making sure to store both raw and pretty names
                switches.push(SwitchItem {
                    mesh_name: raw_node_name.clone(), // This is already the raw node name
                    pretty_name,                      // This is the processed name
                    is_configured,
                    switch_type,
                    raw_node_name, // Store the raw node name in the new field
                });
                break;
            }
        }
    }
    for child in node.children() {
        traverse_node(child, tags, switches, configured_switches, depth + 1);
    }
}

#[tauri::command]
pub async fn load_plane_model_data(app_handle: tauri::AppHandle) -> Result<ParsedGLBData, String> {
    let state = app_handle.state::<Mutex<AppData>>();
    let current_file = {
        let state = state.lock().unwrap();
        state.current_json_file.clone()
    };

    if current_file.is_empty() {
        return Ok(ParsedGLBData {
            switches: vec![],
            model_base64: "".to_string(),
        });
    }

    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("couldn't find app data directory: {}", e))?;

    let plane_config_folder_path = app_data_dir.join(OUTPUT_FOLDER_PATH);
    let current_json_file_path = plane_config_folder_path.join(&current_file);

    let file_contents = fs::read_to_string(&current_json_file_path)
        .map_err(|e| format!("failed to read config file: {}", e))?;

    let json_value: serde_json::Value = serde_json::from_str(&file_contents)
        .map_err(|e| format!("failed to parse config JSON: {}", e))?;

    let model_path = json_value
        .get("modelPath")
        .and_then(|v| v.as_str())
        .ok_or("modelPath not found in the config file")?;

    // Get already configured switches to check against
    let configured_switches: HashSet<String> =
        if let Some(switches_obj) = json_value.get("switches").and_then(|v| v.as_object()) {
            switches_obj.keys().map(|k| k.to_string()).collect()
        } else {
            HashSet::new()
        };

    // Read the model data
    let data = fs::read(model_path).map_err(|e| e.to_string())?;
    let model_base64 = base64::engine::general_purpose::STANDARD.encode(&data);

    // Parse the GLTF file
    let gltf = gltf::Gltf::from_slice(&data).map_err(|e| e.to_string())?;

    let mut switches = Vec::new();
    let tags = ["-Dial", "-Button", "-Lever"];

    for scene in gltf.scenes() {
        for node in scene.nodes() {
            traverse_node(node, &tags, &mut switches, &configured_switches, 0);
        }
    }

    println!("parse_glb: found {} switch(es).", switches.len());

    Ok(ParsedGLBData {
        switches,
        model_base64,
    })
}
