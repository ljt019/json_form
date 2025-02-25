import type { TeleportZoneItem } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { invoke } from "@tauri-apps/api/core";

async function renameTeleportZone(
  oldName: string,
  updatedZone: TeleportZoneItem
) {
  const swappedData = { ...updatedZone };
  try {
    await invoke("rename_teleport_zone", {
      oldName,
      updatedZone: swappedData,
    });
  } catch (error) {
    throw new Error("Failed to rename teleport zone: " + error);
  }
}

export function useRenameTeleportZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["renameTeleportZone"],
    mutationFn: ({
      oldName,
      updatedZone,
    }: {
      oldName: string;
      updatedZone: TeleportZoneItem;
    }) =>
      toast.promise(renameTeleportZone(oldName, updatedZone), {
        loading: `Renaming '${oldName}' to '${updatedZone.name}'...`,
        success: `Renamed to '${updatedZone.name}' successfully`,
        error: (err: any) => `Failed to rename teleport zone: ${err.message}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
    },
  });
}
