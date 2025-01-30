import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

type FileName = string;
type ExistingFiles = FileName[];

async function fetchExistingFiles() {
  const existing_files: ExistingFiles = await invoke(
    "load_existing_plane_config_files"
  );

  return existing_files;
}

export function useGetExistingFiles() {
  return useQuery<ExistingFiles>({
    queryKey: ["existing-files"],
    queryFn: fetchExistingFiles,
  });
}
