import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CuboidIcon as Cube } from "lucide-react";

import { SwitchItem } from "@/screens/switch_editor/SwitchEditorScreen";
import { RotatingPrimitive } from "@/components/rotating-primitive";
import { ErrorCard } from "@/components/error";
import { LoadingCard } from "@/components/loading";

// Separate component for 3D content to isolate Suspense boundary
function ModelViewer({
  selectedSwitch,
}: {
  selectedSwitch: SwitchItem | null;
}) {
  // If we have no switch selected, render an empty scene
  if (!selectedSwitch) {
    return (
      <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <OrbitControls
          enablePan={false}
          maxDistance={0.2}
          minDistance={0.2}
          zoomSpeed={0.5}
          target={[0, 0, 0]}
        />
      </Canvas>
    );
  }

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
      <Scene selectedSwitch={selectedSwitch} />
    </Canvas>
  );
}

// Separate component for scene content to handle model loading
function Scene({ selectedSwitch }: { selectedSwitch: SwitchItem }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight intensity={1.5} position={[10, 10, 10]} castShadow />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.8}
      />
      <RotatingPrimitive
        object={selectedSwitch.mesh}
        scale={[0.1, 0.1, 0.1]}
        position={[0, 0, 0]}
        rotationSpeed={0.005}
      />
      <OrbitControls
        enablePan={false}
        maxDistance={0.2}
        minDistance={0.2}
        zoomSpeed={0.5}
        target={[0, 0, 0]}
      />
    </>
  );
}

interface SwitchModelPreviewProps {
  selectedSwitch: SwitchItem | null;
}

export function SwitchModelPreview({
  selectedSwitch,
}: SwitchModelPreviewProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Cube className="w-6 h-6 mr-2" />
          Switch Model
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full w-full bg-muted rounded-md">
          <ErrorBoundary
            fallback={
              <Html>
                <ErrorCard />
              </Html>
            }
          >
            <Suspense
              fallback={
                <Html>
                  <LoadingCard />
                </Html>
              }
            >
              <ModelViewer selectedSwitch={selectedSwitch} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
