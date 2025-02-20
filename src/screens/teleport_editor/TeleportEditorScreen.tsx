// TeleportEditorScreen.tsx
import { useState, useMemo, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useParsedGLBData } from "@/hooks/queries/useParsedGLBData";
import { TeleportZoneList } from "./components/teleport-zone-list-card";
import { TeleportZoneModelPreview } from "./components/teleport-zone-model-preview-card";

export interface TeleportZoneItem {
  name: string;
  x: number;
  y: number;
  z: number;
}

export function TeleportEditorScreen() {
  return (
    <ErrorBoundary
      fallback={
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-full text-destructive">
            Something went wrong loading the editor.
          </CardContent>
        </Card>
      }
    >
      <Suspense
        fallback={
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              Loading editor...
            </CardContent>
          </Card>
        }
      >
        <TeleportEditorContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function TeleportEditorContent() {
  const { data: planeData } = useGetSelectedConfigData();
  const { data: parsedData } = useParsedGLBData(planeData?.modelPath ?? "");
  const [selectedTeleportZones, setSelectedTeleportZones] = useState<
    TeleportZoneItem[]
  >([]);
  const [hoveredTeleportZone, setHoveredTeleportZone] =
    useState<TeleportZoneItem | null>(null);

  // Convert teleport zones from planeData
  const teleportZoneList: TeleportZoneItem[] = useMemo(() => {
    const zones = planeData?.teleportZones || {};
    return Object.keys(zones).map((key) => ({
      name: key,
      x: zones[key].x,
      y: zones[key].y,
      z: zones[key].z,
    }));
  }, [planeData]);

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

  if (!planeData?.modelPath) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          Please select or create a plane configuration.
        </CardContent>
      </Card>
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
          <TeleportZoneModelPreview
            blobUrl={parsedData.blobUrl}
            teleportZones={teleportZoneList}
            selectedTeleportZones={selectedTeleportZones}
          />
        </div>
      </div>
    </div>
  );
}
