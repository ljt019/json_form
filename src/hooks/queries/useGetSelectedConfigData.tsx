import { useSuspenseQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface FullConfigFile {
  planeName: string;
  modelPath: string;
  teleportZones: {
    [key: string]: {
      x: number;
      y: number;
      z: number;
    };
  };
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
  rawNodeName: string;
}

async function fetchSelectedConfigData(): Promise<FullConfigFile> {
  const configData: string = await invoke("get_current_config_file_contents");
  return JSON.parse(configData);
}

async function fetchInfiniteLoadingSelectedConfigData(): Promise<FullConfigFile> {
  return new Promise(() => {}); // Promise that never resolves, keeping Suspense in fallback mode indefinitely.
}

export function useGetSelectedConfigData() {
  return useSuspenseQuery<FullConfigFile>({
    queryKey: ["selected-config-data"],
    queryFn: fetchSelectedConfigData,
  });
}
