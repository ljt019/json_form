import { useMemo, Suspense, useState } from "react";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";
import { TeleportZoneList } from "./components/teleport-zone-list";
import { PlaneSceneContainer } from "./components/plane-scene-container";
import { useTeleportZoneSelection } from "@/hooks/useTeleportZoneSelection";
import { ErrorCard } from "@/components/error";
import { LoadingCard } from "@/components/loading";
import { useRemoveTeleportZone } from "@/hooks/mutations/useRemoveTeleportZone";
import {
  useUpdateTeleportZone,
  useRenameTeleportZone,
} from "@/hooks/mutations/useUpdateTeleportZone";
import { useDuplicateTeleportZone } from "@/hooks/mutations/useCreateNewTeleportZone";
import type { TeleportZoneItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ErrorBoundary } from "@/components/error-boundary";

export function TeleportEditorScreen() {
  return (
    <ErrorBoundary
      fallback={<ErrorCard message={"Teleport Screen Failed to Load"} />}
    >
      <Suspense fallback={<LoadingCard />}>
        <TeleportEditorContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function TeleportEditorContent() {
  const { data: planeData } = useGetSelectedConfigData();
  const { data: parsedData } = useLoadPlaneModelData(
    planeData?.modelPath ?? ""
  );
  const { mutate: removeTeleportZone } = useRemoveTeleportZone();
  const { mutate: updateTeleportZone } = useUpdateTeleportZone();
  const { mutate: renameTeleportZone } = useRenameTeleportZone();
  const { mutate: duplicateTeleportZone } = useDuplicateTeleportZone();
  
  // State for duplicate zone dialog
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [zoneToDuplicate, setZoneToDuplicate] = useState<TeleportZoneItem | null>(null);
  const [newZoneName, setNewZoneName] = useState("");

  const teleportZoneList = useMemo(() => {
    const zones = planeData?.teleportZones || {};
    return Object.keys(zones)
      .sort((a, b) => a.localeCompare(b)) // Sort alphabetically by name
      .map((key) => ({
        name: key,
        x: zones[key].x,
        y: zones[key].y,
        z: zones[key].z,
      }));
  }, [planeData]);

  const {
    selectedTeleportZones,
    handleSelectTeleportZone,
    handleHoverTeleportZone,
  } = useTeleportZoneSelection({ teleportZones: teleportZoneList });

  const handleDeleteTeleportZone = (zone: TeleportZoneItem) => {
    removeTeleportZone(zone.name);
  };

  const handleUpdateTeleportZone = (updatedZone: TeleportZoneItem) => {
    updateTeleportZone(updatedZone);
  };

  const handleRenameTeleportZone = (
    oldName: string,
    updatedZone: TeleportZoneItem
  ) => {
    renameTeleportZone({ oldName, updatedZone });
  };
  
  const handleDuplicateTeleportZone = (zone: TeleportZoneItem) => {
    setZoneToDuplicate(zone);
    setNewZoneName(`${zone.name}_copy`);
    setIsDuplicateDialogOpen(true);
  };
  
  const handleDuplicateSubmit = () => {
    if (zoneToDuplicate && newZoneName.trim()) {
      duplicateTeleportZone({ 
        zone: zoneToDuplicate, 
        newName: newZoneName.trim() 
      });
      setIsDuplicateDialogOpen(false);
      setZoneToDuplicate(null);
      setNewZoneName("");
    }
  };

  if (!planeData?.modelPath) {
    return <LoadingCard />;
  }

  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col gap-6 h-[calc(100vh-2rem)]">
          <div className="flex-1 min-h-0">
            <TeleportZoneList
              teleportZoneList={teleportZoneList}
              selectedTeleportZones={selectedTeleportZones}
              onSelectTeleportZone={handleSelectTeleportZone}
              onHoverTeleportZone={handleHoverTeleportZone}
              onDeleteTeleportZone={handleDeleteTeleportZone}
              onUpdateTeleportZone={handleUpdateTeleportZone}
              onRenameTeleportZone={handleRenameTeleportZone}
              onDuplicateTeleportZone={handleDuplicateTeleportZone}
            />
          </div>
        </div>
        <div className="w-2/3 h-[calc(100vh-2rem)]">
          <PlaneSceneContainer
            blobUrl={parsedData.blobUrl}
            teleportZones={teleportZoneList}
            selectedTeleportZones={selectedTeleportZones}
          />
        </div>
      </div>
      
      {/* Duplicate Teleport Zone Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Duplicate Teleport Zone</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="col-span-3"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleDuplicateSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicateSubmit} disabled={!newZoneName.trim()}>
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
