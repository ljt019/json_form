import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface PlaneConfigFile {
  file_name: string;
  model_path: string;
}

async function fetchExistingFiles(): Promise<PlaneConfigFile[]> {
  const existing_files: PlaneConfigFile[] = await invoke(
    "load_existing_plane_config_files"
  );
  return existing_files;
}

export function useGetExistingFiles() {
  return useQuery<PlaneConfigFile[]>({
    queryKey: ["existing-files"],
    queryFn: fetchExistingFiles,
  });
}
