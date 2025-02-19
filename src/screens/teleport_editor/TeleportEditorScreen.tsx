import React, { useState, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useParsedGLBData } from "@/hooks/queries/useParsedGLBData";
import {
  TeleportZoneList,
  type TeleportZoneItem,
} from "./components/teleport-zone-list-card";
import { TeleportZoneModelPreview } from "./components/teleport-zone-model-preview-card";

export function TeleportEditorScreen() {
  const navigate = useNavigate();
  const [selectedTeleportZones, setSelectedTeleportZones] = useState<
    TeleportZoneItem[]
  >([]);

  // call hooks unconditionally
  const {
    data: planeData,
    isLoading: isPlaneLoading,
    error: planeError,
  } = useGetSelectedConfigData();
  const modelPath = planeData?.modelPath ?? "";
  const {
    data: parsedData,
    isLoading: isParsedLoading,
    error: parsedError,
  } = useParsedGLBData(modelPath);

  // always compute teleportZoneList even if planeData is not ready
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

  if (isPlaneLoading || !planeData) {
    return (
      <Card className="min-h-screen">
        <CardContent className="flex items-center justify-center h-full">
          Loading config data…
        </CardContent>
      </Card>
    );
  }
  if (planeError) {
    return (
      <Card className="min-h-screen">
        <CardContent className="flex items-center justify-center h-full text-destructive">
          Error loading config data: {planeError.message}
        </CardContent>
      </Card>
    );
  }
  if (isParsedLoading || !parsedData) {
    return (
      <Card className="min-h-screen">
        <CardContent className="flex items-center justify-center h-full">
          Loading parsed GLB data…
        </CardContent>
      </Card>
    );
  }
  if (parsedError) {
    return (
      <Card className="min-h-screen">
        <CardContent className="flex items-center justify-center h-full text-destructive">
          Error parsing GLB: {parsedError.message}
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
              onBack={() => navigate("/")}
              teleportZoneList={teleportZoneList}
              selectedTeleportZones={selectedTeleportZones}
              onSelectTeleportZone={handleSelectTeleportZone}
            />
          </div>
        </div>
        <div className="w-2/3 h-[calc(100vh-2rem)]">
          <Suspense
            fallback={
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                  Loading model…
                </CardContent>
              </Card>
            }
          >
            <TeleportZoneModelPreview blobUrl={parsedData.blobUrl} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
