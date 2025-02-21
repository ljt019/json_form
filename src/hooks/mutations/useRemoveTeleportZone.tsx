import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-hot-toast";

async function removeTeleportZone(teleportZoneKey: string) {
  try {
    await invoke("remove_teleport_zone", { teleportZoneKey });
  } catch (error) {
    throw new Error("failed to remove teleport zone: " + error);
  }
}

export function useRemoveTeleportZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["removeTeleportZone"],
    mutationFn: (teleportZoneKey: string) =>
      toast.promise(removeTeleportZone(teleportZoneKey), {
        loading: `removing teleport zone...`,
        success: `teleport zone removed successfully`,
        error: (err: any) => `failed to remove teleport zone: ${err.message}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
    },
  });
}
