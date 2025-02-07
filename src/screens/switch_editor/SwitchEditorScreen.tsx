import { useState, useEffect, Suspense } from "react";
import { PlaneForm } from "@/components/form/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  CuboidIcon as Cube,
  Settings,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "react-error-boundary";
import { RotatingPrimitive } from "@/components/three-components";
import { invoke } from "@tauri-apps/api/core";

/**
 * Custom hook: useGLBBlobUrl
 * Calls your Rust backend command "open_file" to read the binary GLB file,
 * converts the returned data to a Blob URL, and returns that URL.
 */
function useGLBBlobUrl(modelPath: string): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!modelPath) return;
    setBlobUrl(null);
    let revokeUrl: string | null = null;

    async function loadFile() {
      try {
        // Invoke the Rust command "open_file" to get a Vec<u8>
        const fileData: number[] = await invoke("open_file", {
          path: modelPath,
        });
        // Convert the returned array of numbers into a Uint8Array
        const uint8Array = new Uint8Array(fileData);
        // Create a Blob from the binary data with the appropriate MIME type
        const blob = new Blob([uint8Array], { type: "model/gltf-binary" });
        const url = URL.createObjectURL(blob);
        revokeUrl = url;
        setBlobUrl(url);
      } catch (error) {
        console.error("Error reading GLB file via Rust command:", error);
        setBlobUrl(null);
      }
    }
    loadFile();

    // Cleanup: revoke the Blob URL when the component unmounts or modelPath changes.
    return () => {
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
    };
  }, [modelPath]);

  return blobUrl;
}

/**
 * Updated SwitchItem interface now includes the extracted switch type.
 */
export interface SwitchItem {
  name: string;
  mesh: THREE.Mesh;
  isConfigured: boolean;
  switchType: string;
}

/**
 * Main screen for editing switches.
 */
export function SwitchEditorScreen() {
  const navigate = useNavigate();
  const [selectedSwitch, setSelectedSwitch] = useState<SwitchItem | null>(null);

  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col gap-6 h-[calc(100vh-2rem)]">
          <div className="flex-[1.5] min-h-0">
            <SwitchListLoader
              onBack={() => navigate("/")}
              onSelectSwitch={setSelectedSwitch}
              selectedSwitch={selectedSwitch}
            />
          </div>
          <div className="flex-[1] min-h-0">
            <SwitchModelPreview selectedSwitch={selectedSwitch} />
          </div>
        </div>
        <div className="w-2/3">
          <PlaneForm selectedSwitch={selectedSwitch} />
        </div>
      </div>
    </div>
  );
}

/**
 * SwitchListLoader uses useGetSelectedConfigData and useGLBBlobUrl to load the GLB file.
 * Once the Blob URL is ready, it renders the inner component.
 */
function SwitchListLoader({
  onBack,
  onSelectSwitch,
  selectedSwitch,
}: {
  onBack: () => void;
  onSelectSwitch: (switchItem: SwitchItem | null) => void;
  selectedSwitch: SwitchItem | null;
}) {
  const { data: planeData, isLoading, error } = useGetSelectedConfigData();
  const [modelError, setModelError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          Loading config data...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-destructive">
          Error loading config data: {error.message}
        </CardContent>
      </Card>
    );
  }

  if (!planeData?.modelPath) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          No model path provided.
        </CardContent>
      </Card>
    );
  }

  const blobUrl = useGLBBlobUrl(planeData.modelPath);
  if (!blobUrl) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          Loading Switches...
        </CardContent>
      </Card>
    );
  }

  return (
    <SwitchListInner
      blobUrl={blobUrl}
      planeData={planeData}
      onSelectSwitch={onSelectSwitch}
      selectedSwitch={selectedSwitch}
      modelError={modelError}
      setModelError={setModelError}
      onBack={onBack}
    />
  );
}

/**
 * SwitchListInner uses the Blob URL to load the GLTF model and extract switch meshes.
 */
function SwitchListInner({
  blobUrl,
  planeData,
  onSelectSwitch,
  selectedSwitch,
  modelError,
  setModelError,
  onBack,
}: {
  blobUrl: string;
  planeData: any;
  onSelectSwitch: (switchItem: SwitchItem | null) => void;
  selectedSwitch: SwitchItem | null;
  modelError: string | null;
  setModelError: (msg: string | null) => void;
  onBack: () => void;
}) {
  type GLTFResult = {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.Material };
    scene: THREE.Scene;
    errors: string[];
  };

  const { scene } = useGLTF(blobUrl, undefined, undefined, (error) => {
    console.error("GLTF loading error:", error);
    setModelError(error.message);
  }) as GLTFResult;

  const [switchList, setSwitchList] = useState<SwitchItem[]>([]);

  useEffect(() => {
    if (scene && planeData) {
      const switches: SwitchItem[] = [];
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const switchTags = ["-Dial", "-Button", "-Lever"];
          const tagFound = switchTags.find((tag) => child.name.includes(tag));
          if (tagFound) {
            const baseName = child.name.split(tagFound)[0];
            const typeValue = tagFound.replace("-", "").toLowerCase();
            const isConfigured = Object.keys(planeData.switches).includes(
              baseName
            );
            switches.push({
              name: baseName,
              mesh: child,
              isConfigured,
              switchType: typeValue,
            });
          }
        }
      });
      setSwitchList(switches);
    }
  }, [scene, planeData]);

  useEffect(() => {
    if (!selectedSwitch && switchList.length > 0) {
      onSelectSwitch(switchList[0]);
    }
  }, [switchList, selectedSwitch, onSelectSwitch]);

  if (modelError) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-destructive">
          <p>Error loading 3D model: {modelError}</p>
          <p className="text-muted-foreground">
            Model path: {planeData?.modelPath || "Not provided"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Switch List
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-2">
            {switchList.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                No switches found in the model.
              </div>
            ) : (
              <ul className="space-y-1">
                {switchList.map((switchItem, index) => (
                  <li
                    key={index}
                    className={`py-2 px-3 rounded-md cursor-pointer transition-colors flex items-center justify-between ${
                      selectedSwitch?.name === switchItem.name
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => onSelectSwitch(switchItem)}
                  >
                    <span>{switchItem.name}</span>
                    {switchItem.isConfigured ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * SwitchModelPreview renders a preview of the selected switch’s mesh.
 */
function SwitchModelPreview({
  selectedSwitch,
}: {
  selectedSwitch: SwitchItem | null;
}) {
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
              <Html center>
                <div className="flex items-center justify-center h-full text-destructive">
                  Error loading model
                </div>
              </Html>
            }
          >
            <Suspense
              fallback={
                <Html center>
                  <div className="flex items-center justify-center h-full">
                    Loading model...
                  </div>
                </Html>
              }
            >
              <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
                <ambientLight intensity={1.2} />
                <directionalLight
                  intensity={1.5}
                  position={[10, 10, 10]}
                  castShadow
                />
                <hemisphereLight
                  color={0xffffff}
                  groundColor={0x444444}
                  intensity={0.8}
                />
                {selectedSwitch && (
                  <RotatingPrimitive
                    object={selectedSwitch.mesh}
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
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
