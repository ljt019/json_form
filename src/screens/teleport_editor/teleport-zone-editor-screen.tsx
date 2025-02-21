import { useMemo, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";
import { TeleportZoneList } from "./components/teleport-zone-list";
import { PlaneSceneContainer } from "./components/plane-scene-container";
import { useTeleportZoneSelection } from "@/hooks/useTeleportZoneSelection";
import { ErrorCard } from "@/components/error";
import { LoadingCard } from "@/components/loading";

export function TeleportEditorScreen() {
  return (
    <ErrorBoundary fallback={<ErrorCard />}>
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
  const {
    selectedTeleportZones,
    handleSelectTeleportZone,
    handleHoverTeleportZone,
  } = useTeleportZoneSelection();

  // Convert teleport zones from planeData
  const teleportZoneList = useMemo(() => {
    const zones = planeData?.teleportZones || {};
    return Object.keys(zones).map((key) => ({
      name: key,
      x: zones[key].x,
      y: zones[key].y,
      z: zones[key].z,
    }));
  }, [planeData]);

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
