import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-hot-toast";

export type TeleportZoneFormData = {
  teleportZoneName: string;
  x: number;
  y: number;
  z: number;
};

async function createNewTeleportZone(formData: TeleportZoneFormData) {
  // swap y and z before submitting since threejs is y-up and not z-up like unreal
  const swappedData = { ...formData, y: formData.z, z: formData.y };
  try {
    await invoke("add_new_teleport_zone", { formData: swappedData });
  } catch (error) {
    throw new Error("failed to add new teleport zone: " + error);
  }
}

export default function useCreateNewTeleportZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createNewTeleportZone"],
    mutationFn: (formData: TeleportZoneFormData) =>
      toast.promise(createNewTeleportZone(formData), {
        loading: `adding '${formData.teleportZoneName}'...`,
        success: `'${formData.teleportZoneName}' added successfully`,
        error: (err: any) =>
          `failed to add '${formData.teleportZoneName}': ${err.message}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
    },
  });
}
