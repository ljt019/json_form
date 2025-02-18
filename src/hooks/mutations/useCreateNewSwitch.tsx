// useCreateNewSwitch.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { FormData } from "@/screens/switch_editor/components/form/schema";
import { toast } from "react-hot-toast";

async function createNewSwitch(formData: FormData | FormData[]) {
  // match the rust param name exactly
  return invoke("add_new_switch", { formData: formData }).catch((err) => {
    throw new Error("failed to add new switch: " + err);
  });
}

export default function useCreateNewSwitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createNewSwitch"],
    mutationFn: (formData: FormData | FormData[]) =>
      toast.promise(createNewSwitch(formData), {
        loading: Array.isArray(formData)
          ? "adding selected switch(es)..."
          : `adding '${(formData as FormData).switchName}'...`,
        success: Array.isArray(formData)
          ? "switch(es) added successfully"
          : `'${(formData as FormData).switchName}' added successfully`,
        error: (err: any) =>
          Array.isArray(formData)
            ? `failed to add switch(es): ${err.message}`
            : `failed to add '${(formData as FormData).switchName}': ${
                err.message
              }`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["existing-files"] });
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
      queryClient.invalidateQueries({ queryKey: ["parsed-glb"] });
    },
  });
}
