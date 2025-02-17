use crate::AppData;
use base64::Engine;
use gltf;
use regex::Regex;
use serde::Serialize;
use serde_json::Value as Json;
use std::collections::HashMap;
use std::collections::HashSet;
use std::fs;
use std::io::Read;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

use crate::OUTPUT_FOLDER_PATH;

use crate::models::{
    FullConfigFile, NewSwitchSubmission, ParsedGLBData, PlaneSwitchData, SoundEffect, SwitchData,
    SwitchItem, SwitchType,
};
