import { useState } from "react";
import { Vector3 } from "three";
import {
  useCreateNewTeleportZone,
  TeleportZoneFormData,
} from "@/hooks/mutations/useCreateNewTeleportZone";
import type { TeleportZoneItem } from "@/screens/teleport_editor/TeleportEditorScreen";

export function useTeleportZonePlacement() {
  const [newZoneName, setNewZoneName] = useState("");
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<Vector3 | null>(null);
  const { mutate: createNewTeleportZone } = useCreateNewTeleportZone();

  const handlePlaceZone = () => {
    if (!isPlacementMode || !hoverPoint) return;

    const formData: TeleportZoneFormData = {
      teleportZoneName: newZoneName,
      x: hoverPoint.x,
      y: hoverPoint.y,
      z: hoverPoint.z,
    };

    createNewTeleportZone(formData, {
      onSuccess: () => {
        setNewZoneName("");
        setIsPlacementMode(false);
        setHoverPoint(null);
      },
    });
  };

  const startPlacement = () => setIsPlacementMode(true);
  const cancelPlacement = () => {
    setIsPlacementMode(false);
    setHoverPoint(null);
  };
  const updateHoverPoint = (point: Vector3 | null) => setHoverPoint(point);

  return {
    newZoneName,
    setNewZoneName,
    isPlacementMode,
    hoverPoint,
    handlePlaceZone,
    startPlacement,
    cancelPlacement,
    updateHoverPoint,
  };
}
