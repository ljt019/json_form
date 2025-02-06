import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface FullConfigFile {
  planeName: string;
  modelPath: string;
  switches: {
    [key: string]: SwitchData;
  };
}

interface SwitchData {
  switchType: string;
  switchDescription: string;
  movementAxis: string;
  soundEffect: string;
  movementMode: boolean;
  momentarySwitch: boolean;
  bleedMargins: number;
  defaultPosition: number;
  upperLimit: number;
  lowerLimit: number;
}

async function fetchSelectedConfigData(): Promise<FullConfigFile> {
  const configData: string = await invoke("get_current_file_contents");
  return JSON.parse(configData);
}

export function useGetSelectedConfigData() {
  return useQuery<FullConfigFile>({
    queryKey: ["selected-config-data"],
    queryFn: fetchSelectedConfigData,
  });
}
