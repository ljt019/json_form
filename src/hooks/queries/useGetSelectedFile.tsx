import { useSuspenseQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

type FileName = string;

async function fetchSelectedFile() {
  const existing_files: FileName = await invoke("get_current_config_file");

  return existing_files;
}

export function useGetSelectedFile() {
  return useSuspenseQuery<FileName>({
    queryKey: ["selected-file"],
    queryFn: fetchSelectedFile,
  });
}
