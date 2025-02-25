import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CuboidIcon as Cube } from "lucide-react";
import { RotatingPrimitive } from "@/components/rotating-primitive";
import { useSwitchSelection } from "@/hooks/useSwitchSelection";
import { usePlaneModel } from "@/hooks/usePlaneModel";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";
import { LoadingCard } from "@/components/loading";

function ModelScene() {
  const { data: planeData } = useGetSelectedConfigData();
  const { data: parsedData } = useLoadPlaneModelData(planeData.modelPath);
  const { modelError } = usePlaneModel({ parsedData });
  const { displayedSwitch } = useSwitchSelection();

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight intensity={1.5} position={[10, 10, 10]} castShadow />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.8}
      />
      {displayedSwitch && (
        <RotatingPrimitive
          object={displayedSwitch.mesh}
          scale={[0.1, 0.1, 0.1]}
          position={[0, 0, 0]}
          rotationSpeed={0.005}
        />
      )}
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

function ModelPreviewContent() {
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
          <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
            <ModelScene />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}

export function SwitchModelPreview() {
  return (
    <div className="flex-[1] min-h-0">
      <Suspense fallback={<LoadingCard />}>
        <ModelPreviewContent />
      </Suspense>
    </div>
  );
}
