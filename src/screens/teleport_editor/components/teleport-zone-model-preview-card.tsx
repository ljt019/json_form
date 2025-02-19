import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type * as THREE from "three";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CuboidIcon } from "lucide-react";
import useCreateNewTeleportZone from "@/hooks/mutations/useCreateNewTeleportZone";

interface TeleportZoneModelPreviewProps {
  blobUrl: string;
}

export function TeleportZoneModelPreview({
  blobUrl,
}: TeleportZoneModelPreviewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [instruction, setInstruction] = useState(
    "Enter a zone name and click create teleport zone"
  );
  const { mutate: createTeleportZone } = useCreateNewTeleportZone();
  const modelRef = useRef<THREE.Group>(null);
  const [localPoint, setLocalPoint] = useState<THREE.Vector3 | null>(null);

  const handleModelClick = (point: THREE.Vector3) => {
    if (!isCreating) return;
    if (!modelRef.current) {
      console.error("Model reference not available");
      return;
    }
    // Transform the clicked world point to model-local coordinates
    const newLocalPoint = modelRef.current.worldToLocal(point.clone());
    setLocalPoint(newLocalPoint);
  };

  React.useEffect(() => {
    if (!isCreating || !localPoint) return;

    const x = Number.parseFloat(localPoint.x.toFixed(2));
    const y = Number.parseFloat(localPoint.y.toFixed(2));
    const z = Number.parseFloat(localPoint.z.toFixed(2));

    const zoneData = { teleportZoneName: newZoneName, x, y, z };

    createTeleportZone(zoneData, {
      onSuccess: () => {
        setInstruction("Teleport zone created successfully");
        setIsCreating(false);
        setNewZoneName("");
        setLocalPoint(null);
      },
      onError: () => {
        setInstruction("Failed to create teleport zone");
      },
    });
  }, [isCreating, createTeleportZone, newZoneName, localPoint]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <CuboidIcon className="w-6 h-6 mr-2" />
          Teleport Zone Model
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col">
        <div className="mb-4">
          {isCreating ? (
            <div>
              <p className="mb-1">
                Select location on model for zone:{" "}
                <strong>{newZoneName}</strong>
              </p>
              <p className="text-sm text-muted-foreground">{instruction}</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Zone name"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="flex-grow"
              />
              <Button
                onClick={() => {
                  if (newZoneName.trim() === "") {
                    setInstruction("Please enter a valid zone name");
                    return;
                  }
                  setIsCreating(true);
                  setInstruction("Click on the model to select location");
                }}
              >
                Create Teleport Zone
              </Button>
            </div>
          )}
        </div>
        <div className="flex-grow relative">
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls enabled={!isCreating} />
            <SelectableModel
              blobUrl={blobUrl}
              ref={modelRef}
              onClick={handleModelClick}
            />
            <ClickPlane onClick={handleModelClick} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}

type SelectableModelProps = {
  blobUrl: string;
  onClick: (point: THREE.Vector3) => void;
};

const SelectableModel = React.forwardRef<THREE.Group, SelectableModelProps>(
  ({ blobUrl, onClick }, ref) => {
    const { scene } = useGLTF(blobUrl);
    return (
      <primitive
        object={scene}
        ref={ref}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick(e.point);
        }}
      />
    );
  }
);
SelectableModel.displayName = "SelectableModel";

type ClickPlaneProps = {
  onClick: (point: THREE.Vector3) => void;
};

function ClickPlane({ onClick }: ClickPlaneProps) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick(e.point);
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="white" opacity={0} transparent />
    </mesh>
  );
}
