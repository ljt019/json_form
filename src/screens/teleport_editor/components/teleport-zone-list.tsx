import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FileText, ArrowLeft, Search, Trash2 } from "lucide-react";
import type { TeleportZoneItem } from "@/types";
import { EditableCoordinate } from "./editable-coordinate";

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredZoneList = useMemo(
    () =>
      teleportZoneList.filter((zone) =>
        zone.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [teleportZoneList, searchTerm]
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Teleport Zone List
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden flex flex-col">
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teleport zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <div className="px-4 py-2">
            {filteredZoneList.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                {searchTerm ? "No matches found." : "No teleport zones found."}
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredZoneList.map((zone, index) => {
                  const isSelected = selectedTeleportZones.some(
                    (z) => z.name === zone.name
                  );
                  return (
                    <li
                      key={index}
                      className={`py-2 px-3 rounded-md cursor-pointer transition-colors flex items-center justify-between group ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div
                        className="flex-1 flex items-center justify-between mr-2"
                        onClick={(e) => onSelectTeleportZone(zone, e.shiftKey)}
                        onMouseEnter={() => onHoverTeleportZone(zone)}
                        onMouseLeave={() => onHoverTeleportZone(null)}
                      >
                        <span>{zone.name}</span>
                        <div className="flex items-center space-x-2">
                          <EditableCoordinate
                            value={zone.x}
                            onChange={(value) =>
                              onUpdateTeleportZone({ ...zone, x: value })
                            }
                            label="X"
                          />
                          <EditableCoordinate
                            value={zone.y}
                            onChange={(value) =>
                              onUpdateTeleportZone({ ...zone, y: value })
                            }
                            label="Y"
                          />
                          <EditableCoordinate
                            value={zone.z}
                            onChange={(value) =>
                              onUpdateTeleportZone({ ...zone, z: value })
                            }
                            label="Z"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 p-1 opacity-0 group-hover:opacity-100 hover:text-red-800 transition-opacity ${
                          isSelected
                            ? "hover:bg-primary-foreground/20"
                            : "hover:bg-muted-foreground/20"
                        }`}
                        onClick={() => onDeleteTeleportZone(zone)}
                      >
                        <Trash2 className="w-4 h-4 " />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
        <div className="px-4 py-2 mt-auto">
          <p className="text-sm text-muted-foreground">
            {filteredZoneList.length} teleport zone
            {filteredZoneList.length !== 1 && "s"} found
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
