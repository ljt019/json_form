import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, Copy } from "lucide-react";
import type { TeleportZoneItem } from "@/types";
import { Button } from "@/components/ui/button";
import { SelectableList } from "@/components/selectable-list";
import {
  CoordinateGroup,
  type Coordinates3D,
} from "@/components/coordinate-group";
import { ErrorBoundary } from "@/components/error-boundary";

interface TeleportZoneListProps {
  teleportZoneList: TeleportZoneItem[];
  selectedTeleportZones: TeleportZoneItem[];
  onSelectTeleportZone: (zone: TeleportZoneItem, shiftKey: boolean) => void;
  onHoverTeleportZone: (zone: TeleportZoneItem | null) => void;
  onDeleteTeleportZone: (zone: TeleportZoneItem) => void;
  onUpdateTeleportZone: (zone: TeleportZoneItem) => void;
  onRenameTeleportZone?: (oldName: string, newZone: TeleportZoneItem) => void;
  onDuplicateTeleportZone?: (zone: TeleportZoneItem) => void;
}

export function TeleportZoneList({
  teleportZoneList,
  selectedTeleportZones,
  onSelectTeleportZone,
  onHoverTeleportZone,
  onDeleteTeleportZone,
  onUpdateTeleportZone,
  onRenameTeleportZone,
  onDuplicateTeleportZone,
}: TeleportZoneListProps) {
  const navigate = useNavigate();
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (
    zone: TeleportZoneItem,
    shiftKey: boolean,
    _ctrlKey: boolean
  ) => {
    if (editingZoneId === zone.name) return;
    onSelectTeleportZone(zone, shiftKey);
  };

  const handleCoordinateChange = (
    zone: TeleportZoneItem,
    coordinates: Coordinates3D
  ) => {
    onUpdateTeleportZone({
      ...zone,
      x: coordinates.x,
      y: coordinates.y,
      z: coordinates.z,
    });
  };

  const handleStartEditing = (zone: TeleportZoneItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingZoneId(zone.name);
    setEditingNameValue(zone.name);
  };

  const handleNameSubmit = (
    originalZone: TeleportZoneItem,
    e: React.KeyboardEvent
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitNameChange(originalZone);
    } else if (e.key === "Escape") {
      resetEditing();
    }
  };

  const submitNameChange = (originalZone: TeleportZoneItem) => {
    if (editingNameValue === originalZone.name) {
      resetEditing();
      return;
    }

    if (onRenameTeleportZone) {
      const updatedZone = {
        ...originalZone,
        name: editingNameValue,
      };
      onRenameTeleportZone(originalZone.name, updatedZone);
    } else {
      onUpdateTeleportZone({
        ...originalZone,
        name: editingNameValue,
      });
    }

    resetEditing();
  };

  const resetEditing = useCallback(() => {
    setEditingZoneId(null);
    setEditingNameValue("");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        resetEditing();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [resetEditing]);

  return (
    <ErrorBoundary>
      <SelectableList
        items={teleportZoneList.sort((a, b) => a.name.localeCompare(b.name))}
        selectedItems={selectedTeleportZones}
        onSelect={handleSelect}
        onHover={onHoverTeleportZone}
        title="Teleport Zone List"
        icon={<FileText className="w-6 h-6 mr-2" />}
        onBack={() => navigate("/")}
        searchPlaceholder="Search teleport zones..."
        renderItem={(zone, isSelected) => (
          <div className="flex-1 flex items-center justify-between mr-2">
            {editingZoneId === zone.name ? (
              <input
                ref={inputRef}
                type="text"
                value={editingNameValue}
                className={`bg-transparent border border-primary focus:ring-2 focus:ring-primary rounded px-1 py-0.5 ${
                  isSelected ? "text-black" : ""
                }`}
                onChange={(e) => setEditingNameValue(e.target.value)}
                onKeyDown={(e) => handleNameSubmit(zone, e)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => submitNameChange(zone)}
                autoFocus
              />
            ) : (
              <span
                className={`px-1 py-0.5 rounded hover:bg-muted/50 cursor-text ${
                  isSelected ? "text-primary-foreground" : "text-foreground"
                }`}
                onClick={(e) => handleStartEditing(zone, e)}
              >
                {zone.name}
              </span>
            )}
            <div className="flex items-center">
              <CoordinateGroup
                coordinates={{ x: zone.x, y: zone.y, z: zone.z }}
                onChange={(coords) => handleCoordinateChange(zone, coords)}
                precision={2}
                step={0.1}
              />
              <div className="pl-1 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-8 h-8 p-1 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-opacity ${
                    isSelected
                      ? "hover:bg-primary-foreground/20"
                      : "hover:bg-muted-foreground/20"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateTeleportZone?.(zone);
                  }}
                  title="Duplicate teleport zone"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-8 h-8 p-1 opacity-0 group-hover:opacity-100 hover:text-red-800 transition-opacity ${
                    isSelected
                      ? "hover:bg-primary-foreground/20"
                      : "hover:bg-muted-foreground/20"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTeleportZone(zone);
                  }}
                  title="Delete teleport zone"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        footerContent={(filteredItems) => (
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} teleport zone
            {filteredItems.length !== 1 && "s"} found
          </p>
        )}
      />
    </ErrorBoundary>
  );
}
