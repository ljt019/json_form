import { useCallback, useState } from "react";
import type { TeleportZoneItem } from "@/types";
import { useSelectionState } from "./useSelectionState";

interface UseTeleportZoneSelectionOptions {
  teleportZones?: TeleportZoneItem[];
}

export function useTeleportZoneSelection(
  options: UseTeleportZoneSelectionOptions = {}
) {
  const { teleportZones = [] } = options;

  const {
    selectedItems: selectedTeleportZones,
    hoveredItem: hoveredTeleportZone,
    handleSelect,
    handleHover,
  } = useSelectionState<TeleportZoneItem>(teleportZones, {
    multiSelect: true,
    withShiftSelect: false,
  });

  const handleSelectTeleportZone = useCallback(
    (zone: TeleportZoneItem, shiftKey: boolean) => {
      handleSelect(zone, shiftKey, false);
    },
    [handleSelect]
  );

  const handleHoverTeleportZone = useCallback(
    (zone: TeleportZoneItem | null) => {
      handleHover(zone);
    },
    [handleHover]
  );

  return {
    selectedTeleportZones,
    hoveredTeleportZone,
    handleSelectTeleportZone,
    handleHoverTeleportZone,
    handleSelect,
    handleHover,
  };
}
