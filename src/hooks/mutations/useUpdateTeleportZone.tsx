import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-hot-toast";
import type { TeleportZoneItem } from "@/types";

async function updateTeleportZone(updatedZone: TeleportZoneItem) {
  const swappedData = { ...updatedZone };
  try {
    await invoke("update_teleport_zone", { updatedZone: swappedData });
  } catch (error) {
    throw new Error("Failed to update teleport zone: " + error);
  }
}

async function renameTeleportZone(oldName: string, updatedZone: TeleportZoneItem) {
  const swappedData = { ...updatedZone };
  try {
    await invoke("rename_teleport_zone", { 
      oldName,
      updatedZone: swappedData 
    });
  } catch (error) {
    throw new Error("Failed to rename teleport zone: " + error);
  }
}

export function useUpdateTeleportZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateTeleportZone"],
    mutationFn: (updatedZone: TeleportZoneItem) =>
      toast.promise(updateTeleportZone(updatedZone), {
        loading: `Updating '${updatedZone.name}'...`,
        success: `'${updatedZone.name}' updated successfully`,
        error: (err: any) =>
          `Failed to update '${updatedZone.name}': ${err.message}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
    },
  });
}

export function useRenameTeleportZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["renameTeleportZone"],
    mutationFn: ({ oldName, updatedZone }: { oldName: string, updatedZone: TeleportZoneItem }) =>
      toast.promise(renameTeleportZone(oldName, updatedZone), {
        loading: `Renaming '${oldName}' to '${updatedZone.name}'...`,
        success: `Renamed to '${updatedZone.name}' successfully`,
        error: (err: any) =>
          `Failed to rename teleport zone: ${err.message}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
    },
  });
}
