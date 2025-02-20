import { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CuboidIcon as Cube } from "lucide-react";
import { RotatingPrimitive } from "@/components/three-components";

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

function ModelErrorFallback() {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full text-destructive">
        Error loading 3D model
      </CardContent>
    </Card>
  );
}

// Custom loading fallback that doesn't use drei's Html component
function ModelLoadingFallback() {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </CardContent>
    </Card>
  );
}

interface ModelPreviewProps {
  blobUrl: string;
}

export function ModelPreview({ blobUrl }: ModelPreviewProps) {
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
          <ErrorBoundary fallback={<ModelErrorFallback />}>
            <Suspense fallback={<ModelLoadingFallback />}>
              <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
                <ErrorBoundary
                  fallback={
                    <Html center>
                      <div className="text-destructive">
                        Error loading model
                      </div>
                    </Html>
                  }
                >
                  <Suspense
                    fallback={
                      <Html center>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </Html>
                    }
                  >
                    <ModelViewer blobUrl={blobUrl} />
                  </Suspense>
                </ErrorBoundary>
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
