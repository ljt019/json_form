"use client";

import { useRef, useState, useEffect } from "react";
import { NewFileButton } from "@/components/new-file-button";
import { ExistingFilesList } from "@/components/existing-files-list";
import { OpenOutputDirButton } from "@/components/open-output-dir-button";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import type * as THREE from "three";
import {
  CheckCircle,
  XCircle,
  FileText,
  CuboidIcon as Cube,
  Sliders,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
export function MainScreen() {
  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col">
          <FileManagement />
        </div>
        <div className="w-2/3 flex flex-col gap-6">
          <div className="flex-1 min-h-0">
            <ModelPreview />
          </div>
          <div className="h-1/3 max-h-64">
            <InfoPane />
          </div>
        </div>
      </div>
    </div>
  );
}

function FileManagement() {
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Plane Config Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <NewFileButton onNewFile={() => setIsCreatingNewFile(true)} />
          <OpenOutputDirButton />
        </div>
        <ExistingFilesList
          isCreatingNewFile={isCreatingNewFile}
          onNewFileCreated={() => setIsCreatingNewFile(false)}
        />
      </CardContent>
    </Card>
  );
}

// ModelInner loads the GLTF model.
// It assumes that the file exists.
function ModelInner({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.scale.set(1, 1, 1); // Adjust scale if needed
      modelRef.current.position.set(0, 0, 0); // Center the model
    }
  }, []);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // Slowly rotate the model
    }
  });

  return <primitive ref={modelRef} object={scene} />;
}

// ModelWrapper first checks that the model file exists via a HEAD request,
// and only then loads the model using ModelInner.
// Fallbacks (loading, error, or "no data") are wrapped in <Html> so that they
// are rendered as HTML overlays (and not as Three objects) inside the canvas.
function ModelWrapper() {
  const { data: planeData, isLoading, error } = useGetSelectedConfigData();
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    setFileExists(null);
    setLoadError(null);

    async function checkFileExistence() {
      if (planeData && planeData.modelPath?.includes(".glb")) {
        try {
          const response = await fetch(planeData.modelPath, {
            method: "HEAD",
          });
          const contentType = response.headers.get("content-type");
          setFileExists(
            response.ok && contentType?.includes("model/gltf-binary")
          );
        } catch (e) {
          console.error("Error checking file:", e);
          setFileExists(false);
        }
      } else {
        setFileExists(false);
      }
    }
    checkFileExistence();
  }, [planeData]);

  if (isLoading || fileExists === null) {
    return (
      <Html center>
        <Card>
          <CardContent>Loading...</CardContent>
        </Card>
      </Html>
    );
  }

  if (error || !fileExists) {
    return (
      <Html center>
        <div className="text-nowrap">
          {error
            ? `Error: ${error.message}`
            : "Model file not found or invalid"}
        </div>
      </Html>
    );
  }

  if (!planeData || !planeData.modelPath?.includes(".glb")) {
    return (
      <Html center>
        <Card>
          <CardContent>No valid model data available</CardContent>
        </Card>
      </Html>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Html center>
          <Card>
            <CardContent>Error loading model</CardContent>
          </Card>
        </Html>
      }
    >
      <Suspense
        fallback={
          <Html center>
            <Card>
              <CardContent>Loading model...</CardContent>
            </Card>
          </Html>
        }
      >
        <ModelInner key={planeData.modelPath} modelPath={planeData.modelPath} />
      </Suspense>
    </ErrorBoundary>
  );
}

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

function ModelViewer() {
  return (
    <div className="h-full w-full">
      <Canvas>
        <CameraSetup />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ModelWrapper />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

function ModelPreview() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Cube className="w-6 h-6 mr-2" />
          Model Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full w-full">
          <ModelViewer />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoPane() {
  const { data: planeData, isLoading, error } = useGetSelectedConfigData();
  const navigate = useNavigate();

  const handleConfigureSwitches = () => {
    navigate("/switchEditor");
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent>Error: {error.message}</CardContent>
      </Card>
    );
  }

  if (!planeData) {
    return (
      <Card className="h-full">
        <CardContent>No data available</CardContent>
      </Card>
    );
  }

  const switchesConfigured = Object.keys(planeData.switches).length > 0;
  const switchTypes = [
    ...new Set(Object.values(planeData.switches).map((s) => s.switchType)),
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {planeData.planeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-5rem)] justify-between">
        <div className="space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Switches:</span>
            <div className="flex items-center">
              {switchesConfigured ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  <span>
                    Configured ({Object.keys(planeData.switches).length})
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <XCircle className="w-5 h-5 mr-1" />
                  <span>Not Configured</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Switch Types:</span>
            <span>{switchTypes.join(", ")}</span>
          </div>
          <Separator />
        </div>
        <Button
          onClick={handleConfigureSwitches}
          className="w-full mt-4"
          size="lg"
        >
          <Sliders className="w-5 h-5 mr-2" />
          Configure Switches
        </Button>
      </CardContent>
    </Card>
  );
}
