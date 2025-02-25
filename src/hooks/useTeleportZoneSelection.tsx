import { useCallback, useState } from "react";
import type { TeleportZoneItem } from "@/types";
import { Selectable, useSelectionState, SelectionOptions } from "./useSelectionState";

// Extend TeleportZoneItem to include our Selectable interface requirements
interface SelectableTeleportZoneItem extends TeleportZoneItem, Selectable {
  // The teleport_zone_key property will be used as the unique identifier
}

interface UseTeleportZoneSelectionOptions {
  teleportZones?: SelectableTeleportZoneItem[];
  selectionOptions?: Partial<SelectionOptions<SelectableTeleportZoneItem>>;
}

export function useTeleportZoneSelection(options: UseTeleportZoneSelectionOptions = {}) {
  const { 
    teleportZones = [],
    selectionOptions = {} 
  } = options;
  
  // Track hover state separately
  const [hoveredZone, setHoveredZone] = useState<SelectableTeleportZoneItem | undefined>(undefined);

  // Use our generic selection hook
  const {
    selectedItem,
    selectItem,
    clearSelection,
    isSelected
  } = useSelectionState<SelectableTeleportZoneItem>({
    idField: 'name', // Use name as the ID field
    compareFn: (a, b) => a.name === b.name,
    ...selectionOptions
  }, teleportZones);

  // Provide backward compatible API
  const handleSelectTeleportZone = useCallback(
    (zone: SelectableTeleportZoneItem, shiftKey: boolean) => {
      // If the zone is already selected and they click it again, deselect it
      if (isSelected(zone)) {
        clearSelection();
      } else {
        selectItem(zone);
      }
    },
    [selectItem, clearSelection, isSelected]
  );

  const handleHoverTeleportZone = useCallback(
    (zone: SelectableTeleportZoneItem | null) => {
      setHoveredZone(zone || undefined);
    },
    []
  );

  return {
    // Return in the same format as before for backward compatibility
    selectedTeleportZones: selectedItem ? [selectedItem] : [],
    hoveredTeleportZone: hoveredZone || null,
    handleSelectTeleportZone,
    handleHoverTeleportZone,
    
    // Also expose the new API for future components
    selectedItem,
    selectItem,
    clearSelection,
    isSelected,
  };
}
