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
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SwitchType {
    Lever,
    Button,
    Dial,
    Throttle,
}

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Debug, Serialize, Deserialize)]
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
}
