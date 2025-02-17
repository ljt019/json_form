import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

async function setCurrentFile(file_name: string) {
  await invoke("set_current_config_file", { fileName: file_name });
}

export default function useSetCurrentFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["setCurrentFile"],
    mutationFn: setCurrentFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["selected-file"],
      });
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
    },
    onError: (error) => {
      console.error("Failed to set current file", error);
    },
  });
}
