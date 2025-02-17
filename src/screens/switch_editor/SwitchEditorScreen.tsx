import React, { useState, useMemo, startTransition, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { Card, CardContent } from "@/components/ui/card";

import { PlaneForm } from "@/screens/switch_editor/components/form/form";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useParsedGLBData } from "@/hooks/queries/useParsedGLBData";

import { SwitchList } from "@/screens/switch_editor/components/switch-list-card";
import { SwitchModelPreview } from "@/screens/switch_editor/components/switch-model-preview-card";

/*
Main Screen Component
*/

export interface SwitchItem {
  name: string;
  mesh: THREE.Mesh;
  isConfigured: boolean;
  switchType: string;
}

export function SwitchEditorScreen() {
  return (
    <DataLoader>
      {(planeData, parsedData) => (
        <Suspense
          fallback={
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                Loading 3D model…
              </CardContent>
            </Card>
          }
        >
          <SwitchEditorContent planeData={planeData} parsedData={parsedData} />
        </Suspense>
      )}
    </DataLoader>
  );
}

/* 
  DATA LOADER
*/

function DataLoader({
  children,
}: {
  children: (
    planeData: any,
    parsedData: { switches: any[]; blobUrl: string }
  ) => React.ReactNode;
}) {
  const {
    data: planeData,
    isLoading: isPlaneLoading,
    error: planeError,
  } = useGetSelectedConfigData();

  const modelPath = planeData?.modelPath ?? "";
  const {
    data: parsedData,
    isLoading: isParsedLoading,
    error: parsedError,
  } = useParsedGLBData(modelPath);

  if (isPlaneLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          Loading config data…
        </CardContent>
      </Card>
    );
  }
  if (planeError) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-destructive">
          Error loading config data: {planeError.message}
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
  if (isParsedLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          Loading parsed GLB data…
        </CardContent>
      </Card>
    );
  }
  if (parsedError) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-destructive">
          Error parsing GLB: {parsedError.message}
        </CardContent>
      </Card>
    );
  }
  if (!parsedData) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          No parsed GLB data available.
        </CardContent>
      </Card>
    );
  }

  return <>{children(planeData, parsedData)}</>;
}

/* 
  SWITCH EDITOR CONTENT
*/

export function SwitchEditorContent({
  planeData,
  parsedData,
}: {
  planeData: any;
  parsedData: { switches: any[]; blobUrl: string };
}) {
  const navigate = useNavigate();
  const [modelError, setModelError] = useState<string | null>(null);

  // Load glTF
  const { scene } = useGLTF(
    parsedData.blobUrl,
    undefined,
    undefined,
    (error) => {
      console.error("GLTF loading error:", error);
      setModelError("GLTF loading error");
    }
  ) as unknown as { scene: THREE.Scene };

  // Create switch list from the loaded scene
  const switchList: SwitchItem[] = useMemo(() => {
    if (!scene) return [];
    return (parsedData.switches || [])
      .map((s) => {
        const mesh = scene.getObjectByName(s.meshName);
        if (mesh && mesh instanceof THREE.Mesh) {
          return {
            name: s.prettyName,
            mesh,
            isConfigured: s.isConfigured,
            switchType: s.switchType,
          };
        }
        return null;
      })
      .filter((x): x is SwitchItem => x !== null);
  }, [scene, parsedData]);

  // Track which switch the user selected
  const [selectedSwitch, setSelectedSwitch] = useState<SwitchItem | null>(null);

  // Derive the displayed switch. Fallback to the first switch in the list if
  // there's no valid (or available) `selectedSwitch`.
  const displayedSwitch = useMemo(() => {
    if (selectedSwitch && switchList.includes(selectedSwitch)) {
      return selectedSwitch;
    }
    return switchList[0] ?? null;
  }, [selectedSwitch, switchList]);

  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col gap-6 h-[calc(100vh-2rem)]">
          <div className="flex-[1.5] min-h-0">
            <SwitchList
              onBack={() => navigate("/")}
              switchList={switchList}
              selectedSwitch={displayedSwitch}
              onSelectSwitch={(sw) =>
                startTransition(() => {
                  setSelectedSwitch(sw);
                })
              }
              modelError={modelError}
              modelPath={planeData.modelPath}
            />
          </div>
          <div className="flex-[1] min-h-0">
            <SwitchModelPreview selectedSwitch={displayedSwitch} />
          </div>
        </div>
        <div className="w-2/3">
          <PlaneForm selectedSwitch={displayedSwitch} />
        </div>
      </div>
    </div>
  );
}
