import { useMemo, Suspense } from "react";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";
import { TeleportZoneList } from "./components/teleport-zone-list";
import { PlaneSceneContainer } from "./components/plane-scene-container";
import { useTeleportZoneSelection } from "@/hooks/useTeleportZoneSelection";
import { ErrorCard } from "@/components/error";
import { LoadingCard } from "@/components/loading";
import { useRemoveTeleportZone } from "@/hooks/mutations/useRemoveTeleportZone";
import { useUpdateTeleportZone } from "@/hooks/mutations/useUpdateTeleportZone";
import { useDuplicateTeleportZone } from "@/hooks/mutations/useDuplicateTeleportZone";
import { useRenameTeleportZone } from "@/hooks/mutations/useRenameTeleportZone";
import type { TeleportZoneItem } from "@/types";
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

  const teleportZoneList = useMemo(() => {
    const zones = planeData?.teleportZones || {};
    return Object.keys(zones)
      .sort((a, b) => a.localeCompare(b))
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
  } = useTeleportZoneSelection({
    teleportZones: teleportZoneList,
  });

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
    const baseName = zone.name;
    let newName = `${baseName}(1)`;
    let counter = 1;

    while (teleportZoneList.some((z) => z.name === newName)) {
      counter++;
      newName = `${baseName}(${counter})`;
    }

    duplicateTeleportZone({
      zone: zone,
      newName: newName,
    });
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
    </div>
  );
}
