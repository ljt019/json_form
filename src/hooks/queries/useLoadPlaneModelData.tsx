import { useSuspenseQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface ParsedSwitchItem {
  meshName: string;
  prettyName: string;
  isConfigured: boolean;
  switchType: string;
}

export interface PlaneModelData {
  switches: ParsedSwitchItem[];
  modelBase64: string;
}

async function loadPlaneModelData(modelPath: string): Promise<PlaneModelData> {
  const result = await invoke<PlaneModelData>("load_plane_model_data", {
    modelPath,
  });
  return result;
}

export function useLoadPlaneModelData(modelPath: string) {
  return useSuspenseQuery({
    queryKey: ["parsed-glb", modelPath],
    queryFn: async () => {
      if (!modelPath) {
        return { switches: [], blobUrl: "" };
      }
      const data = await loadPlaneModelData(modelPath);
      const byteCharacters = atob(data.modelBase64.trim());
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "model/gltf-binary" });
      const blobUrl = URL.createObjectURL(blob);

      return { switches: data.switches, blobUrl };
    },
  });
}
