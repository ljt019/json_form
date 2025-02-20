import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CuboidIcon as Cube } from "lucide-react";
import * as THREE from "three";

import { SwitchItem } from "@/screens/switch_editor/SwitchEditorScreen";
import { RotatingPrimitive } from "@/components/three-components";

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

// Custom error fallback for 3D content
function ModelErrorFallback({ error }: { error: Error }) {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-2 text-destructive">
        <p>Failed to load 3D model</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </Html>
  );
}

// Custom loading state for 3D content
function ModelLoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </Html>
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
              <ModelErrorFallback
                error={new Error("Failed to initialize 3D context")}
              />
            }
          >
            <Suspense fallback={<ModelLoadingFallback />}>
              <ModelViewer selectedSwitch={selectedSwitch} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
