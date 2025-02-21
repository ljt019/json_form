import { useState, useMemo, startTransition, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "react-error-boundary";

import { PlaneForm } from "@/screens/switch_editor/components/form/form";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";
import { SwitchList } from "@/screens/switch_editor/components/switch-list-card";
import { SwitchModelPreview } from "@/screens/switch_editor/components/switch-model-preview-card";
import { ErrorCard } from "@/components/error";
import { LoadingCard } from "@/components/loading";

export interface SwitchItem {
  name: string;
  mesh: THREE.Mesh;
  isConfigured: boolean;
  switchType: string;
}

export function SwitchEditorScreen() {
  return (
    <ErrorBoundary fallback={<ErrorCard />}>
      <Suspense fallback={<LoadingCard />}>
        <SwitchEditorContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function SwitchEditorContent() {
  const navigate = useNavigate();
  const [modelError, setModelError] = useState<string | null>(null);

  // Data fetching with Suspense
  const { data: planeData } = useGetSelectedConfigData();
  const { data: parsedData } = useLoadPlaneModelData(planeData.modelPath);

  // Load GLTF
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

  // Initialize selected switches with the first switch if available
  const initialSelectedSwitch = switchList.length > 0 ? [switchList[0]] : [];
  const [selectedSwitches, setSelectedSwitches] = useState<SwitchItem[]>(
    initialSelectedSwitch
  );
  const [anchorIndex, setAnchorIndex] = useState<number>(
    switchList.length > 0 ? 0 : -1
  );

  const displayedSwitch = selectedSwitches[0] ?? switchList[0] ?? null;

  const handleSelectSwitch = (
    sw: SwitchItem,
    shiftKey: boolean,
    ctrlKey: boolean
  ) => {
    const currentIndex = switchList.findIndex((s) => s.name === sw.name);
    startTransition(() => {
      if (shiftKey) {
        if (anchorIndex !== -1) {
          const start = Math.min(anchorIndex, currentIndex);
          const end = Math.max(anchorIndex, currentIndex);
          const range = switchList.slice(start, end + 1);
          if (ctrlKey) {
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
            setSelectedSwitches(range);
          }
        } else {
          setSelectedSwitches([sw]);
        }
        setAnchorIndex(currentIndex);
      } else if (ctrlKey) {
        setSelectedSwitches((prev) => {
          const exists = prev.find((s) => s.name === sw.name);
          return exists
            ? prev.filter((s) => s.name !== sw.name)
            : [...prev, sw];
        });
        setAnchorIndex(currentIndex);
      } else {
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
