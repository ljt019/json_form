import { useState } from "react";
import type { TeleportZoneItem } from "@/screens/teleport_editor/TeleportEditorScreen";

export function useTeleportZoneSelection() {
  const [selectedTeleportZones, setSelectedTeleportZones] = useState<
    TeleportZoneItem[]
  >([]);
  const [hoveredTeleportZone, setHoveredTeleportZone] =
    useState<TeleportZoneItem | null>(null);

  const handleSelectTeleportZone = (
    zone: TeleportZoneItem,
    shiftKey: boolean
  ) => {
    if (shiftKey) {
      setSelectedTeleportZones((prev) => {
        const exists = prev.some((item) => item.name === zone.name);
        return exists
          ? prev.filter((item) => item.name !== zone.name)
          : [...prev, zone];
      });
    } else {
      setSelectedTeleportZones([zone]);
    }
  };

  const handleHoverTeleportZone = (zone: TeleportZoneItem | null) => {
    setHoveredTeleportZone(zone);
  };

  return {
    selectedTeleportZones,
    hoveredTeleportZone,
    handleSelectTeleportZone,
    handleHoverTeleportZone,
  };
}
