import type { TeleportZoneItem } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCreateNewTeleportZone } from "@/hooks/mutations/useCreateNewTeleportZone";
import { toast } from "react-hot-toast";

// Custom hook for duplicating a teleport zone
export function useDuplicateTeleportZone() {
  const queryClient = useQueryClient();
  const createTeleportZone = useCreateNewTeleportZone();

  const duplicateTeleportZone = async (
    zone: TeleportZoneItem,
    newName: string
  ) => {
    await createTeleportZone.mutateAsync({
      teleportZoneName: newName,
      x: zone.x,
      y: zone.z,
      z: -zone.y,
    });
  };

  return useMutation({
    mutationKey: ["duplicateTeleportZone"],
    mutationFn: ({
      zone,
      newName,
    }: {
      zone: TeleportZoneItem;
      newName: string;
    }) =>
      toast.promise(duplicateTeleportZone(zone, newName), {
        loading: `Duplicating '${zone.name}' as '${newName}'...`,
        success: `'${newName}' created successfully`,
        error: (err: any) =>
          `Failed to duplicate teleport zone: ${err.message}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selected-config-data"] });
    },
  });
}
