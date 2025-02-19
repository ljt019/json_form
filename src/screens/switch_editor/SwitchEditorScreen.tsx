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
main screen component
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
                loading 3d model…
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
  data loader
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
          loading config data…
        </CardContent>
      </Card>
    );
  }
  if (planeError) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-destructive">
          error loading config data: {planeError.message}
        </CardContent>
      </Card>
    );
  }
  if (!planeData?.modelPath) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          no model path provided.
        </CardContent>
      </Card>
    );
  }
  if (isParsedLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          loading parsed glb data…
        </CardContent>
      </Card>
    );
  }
  if (parsedError) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-destructive">
          error parsing glb: {parsedError.message}
        </CardContent>
      </Card>
    );
  }
  if (!parsedData) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          no parsed glb data available.
        </CardContent>
      </Card>
    );
  }

  return <>{children(planeData, parsedData)}</>;
}

/* 
  switch editor content
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

  // load gltf
  const { scene } = useGLTF(
    parsedData.blobUrl,
    undefined,
    undefined,
    (error) => {
      console.error("gltf loading error:", error);
      setModelError("gltf loading error");
    }
  ) as unknown as { scene: THREE.Scene };

  // create switch list from the loaded scene
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

  // track which switches the user selected (multi-select)
  const [selectedSwitches, setSelectedSwitches] = useState<SwitchItem[]>([]);
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);

  // derive the displayed switch – use the first selected, or fallback to the first in the list
  const displayedSwitch = useMemo(() => {
    if (selectedSwitches.length > 0) {
      return selectedSwitches[0];
    }
    return switchList[0] ?? null;
  }, [selectedSwitches, switchList]);

  // callback for selection (receives the switch and whether shift/ctrl were held)
  const handleSelectSwitch = (
    sw: SwitchItem,
    shiftKey: boolean,
    ctrlKey: boolean
  ) => {
    const currentIndex = switchList.findIndex((s) => s.name === sw.name);
    startTransition(() => {
      if (shiftKey) {
        if (anchorIndex !== null) {
          const start = Math.min(anchorIndex, currentIndex);
          const end = Math.max(anchorIndex, currentIndex);
          const range = switchList.slice(start, end + 1);
          if (ctrlKey) {
            // add the range to the existing selection
            setSelectedSwitches((prev) => {
              const newSelection = [...prev];
              range.forEach((item) => {
                if (!newSelection.some((s) => s.name === item.name)) {
                  newSelection.push(item);
                }
              });
              return newSelection;
            });
          } else {
            // replace selection with the range
            setSelectedSwitches(range);
          }
        } else {
          // no anchor set; fallback to single selection
          setSelectedSwitches([sw]);
        }
        setAnchorIndex(currentIndex);
      } else if (ctrlKey) {
        // toggle the clicked item without affecting the rest
        setSelectedSwitches((prev) => {
          const exists = prev.find((s) => s.name === sw.name);
          return exists
            ? prev.filter((s) => s.name !== sw.name)
            : [...prev, sw];
        });
        setAnchorIndex(currentIndex);
      } else {
        // no modifier: single selection
        setSelectedSwitches([sw]);
        setAnchorIndex(currentIndex);
      }
    });
  };

  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col gap-6 h-[calc(100vh-2rem)]">
          <div className="flex-[1.5] min-h-0">
            <SwitchList
              onBack={() => navigate("/")}
              switchList={switchList}
              selectedSwitches={selectedSwitches}
              onSelectSwitch={handleSelectSwitch}
              modelError={modelError}
              modelPath={planeData.modelPath}
            />
          </div>
          <div className="flex-[1] min-h-0">
            <SwitchModelPreview selectedSwitch={displayedSwitch} />
          </div>
        </div>
        <div className="w-2/3">
          <PlaneForm selectedSwitches={selectedSwitches} />
        </div>
      </div>
    </div>
  );
}
