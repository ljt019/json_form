import { useMemo, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";
import { TeleportZoneList } from "./components/teleport-zone-list";
import { PlaneSceneContainer } from "./components/plane-scene-container";
import { useTeleportZoneSelection } from "@/hooks/useTeleportZoneSelection";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingCardProps {
  message: string;
  variant?: "default" | "error" | "muted";
}

function LoadingCard({ message, variant = "default" }: LoadingCardProps) {
  const textColorClass = {
    default: "",
    error: "text-destructive",
    muted: "text-muted-foreground",
  }[variant];

  return (
    <Card className="h-full">
      <CardContent
        className={`flex items-center justify-center h-full ${textColorClass}`}
      >
        {message}
      </CardContent>
    </Card>
  );
}

export function TeleportEditorScreen() {
  return (
    <ErrorBoundary
      fallback={
        <LoadingCard
          message="Something went wrong loading the editor."
          variant="error"
        />
      }
    >
      <Suspense fallback={<LoadingCard message="Loading editor..." />}>
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
    return (
      <LoadingCard
        message="Please select or create a plane configuration."
        variant="muted"
      />
    );
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
