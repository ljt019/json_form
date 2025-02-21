import { useState, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SwitchItem } from "@/types";

interface UsePlaneModelProps {
  parsedData: {
    blobUrl: string;
    switches?: Array<{
      meshName: string;
      prettyName: string;
      isConfigured: boolean;
      switchType: string;
    }>;
  };
}

export function usePlaneModel({ parsedData }: UsePlaneModelProps) {
  const [modelError, setModelError] = useState<string | null>(null);

  const { scene } = useGLTF(
    parsedData.blobUrl,
    undefined,
    undefined,
    (error) => {
      console.error("GLTF loading error:", error);
      setModelError("GLTF loading error");
    }
  ) as unknown as { scene: THREE.Scene };

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

  return { switchList, modelError };
}
