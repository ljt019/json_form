// TeleportZoneModelPreview.tsx
import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CuboidIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import {
  useCreateNewTeleportZone,
  TeleportZoneFormData,
} from "@/hooks/mutations/useCreateNewTeleportZone";
import type { TeleportZoneItem } from "../TeleportEditorScreen";

interface ModelViewerProps {
  blobUrl: string;
  onClick: () => void;
  onPointerMove: (point: THREE.Vector3 | null) => void;
  teleportZones: TeleportZoneItem[];
  selectedTeleportZones: TeleportZoneItem[];
  isPlacementMode: boolean;
  hoverPoint: THREE.Vector3 | null;
}

interface TeleportZoneModelPreviewProps {
  blobUrl: string;
  teleportZones: TeleportZoneItem[];
  selectedTeleportZones: TeleportZoneItem[];
}

export function TeleportZoneModelPreview({
  blobUrl,
  teleportZones,
  selectedTeleportZones,
}: TeleportZoneModelPreviewProps) {
  const [newZoneName, setNewZoneName] = useState("");
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<THREE.Vector3 | null>(null);
  const { mutate: createNewTeleportZone } = useCreateNewTeleportZone();

  const handleCanvasClick = () => {
    if (!isPlacementMode || !hoverPoint) return;

    const newZone: TeleportZoneItem = {
      name: newZoneName,
      x: hoverPoint.x,
      y: hoverPoint.y,
      z: hoverPoint.z,
    };

    const formData: TeleportZoneFormData = {
      teleportZoneName: newZone.name,
      x: newZone.x,
      y: newZone.y,
      z: newZone.z,
    };

    createNewTeleportZone(formData, {
      onSuccess: () => {
        setNewZoneName("");
        setIsPlacementMode(false);
        setHoverPoint(null);
      },
    });
  };

  const handleStartPlacement = () => {
    setIsPlacementMode(true);
  };

  const handleCancelPlacement = () => {
    setIsPlacementMode(false);
    setHoverPoint(null);
  };

  const handlePointerMove = (point: THREE.Vector3 | null) => {
    setHoverPoint(point);
  };

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
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div className="text-red-500">
              Error loading model: {error.message}
            </div>
          )}
        >
          <Suspense
            fallback={<div className="text-center">Loading model...</div>}
          >
            <Canvas camera={{ position: [5, 5, 5] }}>
              <ModelViewer
                blobUrl={blobUrl}
                onClick={handleCanvasClick}
                onPointerMove={handlePointerMove}
                teleportZones={teleportZones}
                selectedTeleportZones={selectedTeleportZones}
                isPlacementMode={isPlacementMode}
                hoverPoint={hoverPoint}
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
            <Button onClick={handleStartPlacement} disabled={!newZoneName}>
              Create New Zone
            </Button>
          ) : (
            <Button variant="outline" onClick={handleCancelPlacement}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ModelViewer({
  blobUrl,
  onClick,
  onPointerMove,
  teleportZones,
  selectedTeleportZones,
  isPlacementMode,
  hoverPoint,
}: ModelViewerProps) {
  const modelRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(blobUrl);

  const handlePointerMove = (event: any) => {
    if (!isPlacementMode) return;

    if (event.intersections && event.intersections.length > 0) {
      onPointerMove(event.intersections[0].point);
    } else {
      onPointerMove(null);
    }
  };

  const handleClick = () => {
    if (!isPlacementMode || !hoverPoint) return;
    onClick();
  };

  return (
    <>
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.6}
      />
      <primitive
        object={scene}
        ref={modelRef}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      />
      {teleportZones.map((zone) => (
        <Sphere
          key={zone.name}
          position={[zone.x, zone.z, -zone.y]}
          args={[0.1, 32, 32]}
        >
          <meshStandardMaterial
            color={
              selectedTeleportZones.some((s) => s.name === zone.name)
                ? "#ff0000"
                : "#0000ff"
            }
            emissive={
              selectedTeleportZones.some((s) => s.name === zone.name)
                ? "#ff0000"
                : "#0000ff"
            }
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
      {isPlacementMode && hoverPoint && (
        <Sphere
          position={[hoverPoint.x, hoverPoint.y, hoverPoint.z]}
          args={[0.1, 32, 32]}
        >
          <meshStandardMaterial color="#00ff00" opacity={0.5} transparent />
        </Sphere>
      )}
      <OrbitControls enabled={!isPlacementMode} />
    </>
  );
}
