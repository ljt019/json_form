import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CuboidIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { useTeleportZonePlacement } from "@/hooks/useTeleportZonePlacement";
import { TeleportZoneItem } from "@/types";
import { PlaneSceneRenderer } from "./plane-scene-renderer";
import { ErrorCard } from "@/components/error";
import { LoadingCard } from "@/components/loading";

interface PlaneSceneContainerProps {
  blobUrl: string;
  teleportZones: TeleportZoneItem[];
  selectedTeleportZones: TeleportZoneItem[];
}

export function PlaneSceneContainer({
  blobUrl,
  teleportZones,
  selectedTeleportZones,
}: PlaneSceneContainerProps) {
  const { scene } = useGLTF(blobUrl);

  const {
    newZoneName,
    setNewZoneName,
    isPlacementMode,
    hoverPoint,
    handlePlaceZone,
    startPlacement,
    cancelPlacement,
    updateHoverPoint,
  } = useTeleportZonePlacement();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CuboidIcon className="mr-2 h-4 w-4" />
          Teleport Zone Model Preview
          {isPlacementMode && (
            <span className="ml-4 text-sm font-normal text-muted-foreground">
              Click on the model to place the teleport zone
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 flex-grow relative">
        <ErrorBoundary fallback={<ErrorCard />}>
          <Suspense fallback={<LoadingCard />}>
            <Canvas camera={{ position: [5, 5, 5] }}>
              <PlaneSceneRenderer
                scene={scene}
                isPlacementMode={isPlacementMode}
                hoverPoint={hoverPoint}
                onPointerMove={updateHoverPoint}
                onClick={handlePlaceZone}
                teleportZones={teleportZones}
                selectedTeleportZones={selectedTeleportZones}
              />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </CardContent>

      <CardContent className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="New zone name"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            className="flex-grow"
            disabled={isPlacementMode}
          />
          {!isPlacementMode ? (
            <Button onClick={startPlacement} disabled={!newZoneName}>
              Create New Zone
            </Button>
          ) : (
            <Button variant="outline" onClick={cancelPlacement}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
