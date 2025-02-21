import { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CuboidIcon as Cube } from "lucide-react";
import { RotatingPrimitive } from "@/components/rotating-primitive";
import { LoadingCard } from "@/components/loading";
import { ErrorCard } from "@/components/error";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";

interface ModelViewerProps {
  blobUrl: string;
}

function ModelViewer({ blobUrl }: ModelViewerProps) {
  const orbitRef = useRef<any>(null);
  const { scene } = useGLTF(blobUrl);

  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  }, [blobUrl]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight intensity={1} position={[10, 10, 10]} castShadow />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.6}
      />

      <RotatingPrimitive
        object={scene}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        rotationSpeed={0.005}
      />

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        minDistance={60}
        maxDistance={200}
        zoomSpeed={0.5}
      />
    </>
  );
}

export function ModelPreview() {
  const { data: planeData } = useGetSelectedConfigData();
  const modelPath = planeData?.modelPath ?? "";
  const { data: parsedData } = useLoadPlaneModelData(modelPath);

  if (!modelPath) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Cube className="w-6 h-6 mr-2" />
            Plane Model
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center text-muted-foreground">
          Please select or create a plane configuration.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Cube className="w-6 h-6 mr-2" />
          Plane Model
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full w-full">
          <ErrorBoundary fallback={<LoadingCard />}>
            <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
              <ErrorBoundary
                fallback={
                  <Html center>
                    <ErrorCard />
                  </Html>
                }
              >
                <Suspense
                  fallback={
                    <Html center>
                      <LoadingCard />
                    </Html>
                  }
                >
                  <ModelViewer blobUrl={parsedData.blobUrl} />
                </Suspense>
              </ErrorBoundary>
            </Canvas>
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
