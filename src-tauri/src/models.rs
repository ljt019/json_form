use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaneSwitchData {
    pub switches: HashMap<String, SwitchData>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SwitchData {
    pub switch_type: SwitchType,
    pub switch_description: String,
    pub movement_axis: MovementAxis,
    pub sound_effect: SoundEffect,
    pub movement_mode: bool,
    pub momentary_switch: bool,
    pub bleed_margins: f32,
    pub default_position: f32,
    pub upper_limit: f32,
    pub lower_limit: f32,
    pub raw_node_name: String, // Added the raw node name field
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum SwitchType {
    Lever,
    Button,
    Dial,
    Throttle,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum MovementAxis {
    X,
    Y,
    Z,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SoundEffect {
    LeverSound,
    ButtonSound,
    DialSound,
    ThrottleSound,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewSwitchSubmission {
    pub switch_type: SwitchType,
    pub switch_name: String,
    pub switch_description: String,
    pub movement_axis: MovementAxis,
    pub movement_mode: bool,
    pub momentary_switch: bool,
    pub bleed_margins: f32,
    pub default_position: f32,
    pub upper_limit: f32,
    pub lower_limit: f32,
    pub raw_node_name: String, // Added the raw node name field
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewTeleportZoneSubmission {
    pub teleport_zone_name: String,
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FullConfigFile {
    pub plane_name: String,
    pub model_path: String,
    pub teleport_zones: HashMap<String, TeleportZone>,
    pub switches: HashMap<String, SwitchData>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SwitchItem {
    pub mesh_name: String,
    pub pretty_name: String,
    pub is_configured: bool,
    pub switch_type: String,
    pub raw_node_name: String, // Added to ensure we track this in the UI
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedGLBData {
    pub switches: Vec<SwitchItem>,
    pub model_base64: String,
}

#[derive(Serialize)]
pub struct PlaneConfigFile {
    pub file_name: String,
    pub model_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TeleportZone {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}
