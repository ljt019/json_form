import { useNavigate } from "react-router-dom";
import { FileText, Trash2 } from "lucide-react";
import type { TeleportZoneItem } from "@/types";
import { Button } from "@/components/ui/button";
import { SelectableList } from "@/components/selectable-list";
import { CoordinateGroup, Coordinates3D } from "@/components/coordinate-group";
import { ErrorBoundary } from "@/components/error-boundary";

interface TeleportZoneListProps {
  teleportZoneList: TeleportZoneItem[];
  selectedTeleportZones: TeleportZoneItem[];
  onSelectTeleportZone: (zone: TeleportZoneItem, shiftKey: boolean) => void;
  onHoverTeleportZone: (zone: TeleportZoneItem | null) => void;
  onDeleteTeleportZone: (zone: TeleportZoneItem) => void;
  onUpdateTeleportZone: (zone: TeleportZoneItem) => void;
}

export function TeleportZoneList({
  teleportZoneList,
  selectedTeleportZones,
  onSelectTeleportZone,
  onHoverTeleportZone,
  onDeleteTeleportZone,
  onUpdateTeleportZone,
}: TeleportZoneListProps) {
  const navigate = useNavigate();

  // Adapter function for the SelectableList component
  const handleSelect = (zone: TeleportZoneItem, shiftKey: boolean, ctrlKey: boolean) => {
    onSelectTeleportZone(zone, shiftKey);
  };
  
  // Handler for coordinate changes
  const handleCoordinateChange = (zone: TeleportZoneItem, coordinates: Coordinates3D) => {
    onUpdateTeleportZone({
      ...zone,
      x: coordinates.x,
      y: coordinates.y,
      z: coordinates.z
    });
  };

  return (
    <ErrorBoundary>
      <SelectableList
        items={teleportZoneList}
        selectedItems={selectedTeleportZones}
        onSelect={handleSelect}
        onHover={onHoverTeleportZone}
        title="Teleport Zone List"
        icon={<FileText className="w-6 h-6 mr-2" />}
        onBack={() => navigate("/")}
        searchPlaceholder="Search teleport zones..."
        idField="name"
        sortable={true}
        showPagination={teleportZoneList.length > 10}
        pageSize={10}
        filterOptions={{
          filterFields: ['name'],
          sortField: 'name',
          sortDirection: 'asc'
        }}
        renderItem={(zone, isSelected) => (
          <div className="flex-1 flex items-center justify-between mr-2">
            <span>{zone.name}</span>
            <div className="flex items-center">
              <CoordinateGroup
                coordinates={{ x: zone.x, y: zone.y, z: zone.z }}
                onChange={(coords) => handleCoordinateChange(zone, coords)}
                precision={2}
                step={0.1}
              />
              <Button
                variant="ghost"
                size="icon"
                className={`w-8 h-8 p-1 ml-2 opacity-0 group-hover:opacity-100 hover:text-red-800 transition-opacity ${
                  isSelected
                    ? "hover:bg-primary-foreground/20"
                    : "hover:bg-muted-foreground/20"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTeleportZone(zone);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
