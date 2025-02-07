import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { FormData } from "@/components/form/schema";
import { toast } from "react-hot-toast";

async function createNewSwitch(formData: FormData) {
  try {
    await invoke("add_new_switch", { formData });
  } catch (error) {
    throw new Error("Failed to add new switch: " + error);
  }
}

export default function useCreateNewSwitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createNewSwitch"],
    mutationFn: (formData: FormData) =>
      toast.promise(createNewSwitch(formData), {
        loading: `Adding '${formData.switchName}'...`,
        success: `'${formData.switchName}' added successfully`,
        error: (err: any) =>
          `Failed to add '${formData.switchName}': ${err.message}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["existing-files"],
      });
      queryClient.invalidateQueries({
        queryKey: ["selected-config-data"],
      });
    },
  });
}
