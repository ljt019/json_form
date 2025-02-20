import { useSuspenseQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

// These types represent what the backend sends.
export interface ParsedSwitchItem {
  meshName: string;
  prettyName: string;
  isConfigured: boolean;
  switchType: string;
}

export interface ParsedGLBData {
  switches: ParsedSwitchItem[];
  modelBase64: string;
}

interface BackendGLBData extends ParsedGLBData {}

async function fetchParsedGLBData(modelPath: string): Promise<BackendGLBData> {
  const result = await invoke<BackendGLBData>("parse_glb", { modelPath });
  return result;
}

export function useParsedGLBData(modelPath: string) {
  return useSuspenseQuery({
    queryKey: ["parsed-glb", modelPath],
    queryFn: async () => {
      if (!modelPath) {
        return { switches: [], blobUrl: "" };
      }
      const data = await fetchParsedGLBData(modelPath);
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
