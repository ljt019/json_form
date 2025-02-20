import { useRef, useEffect } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TeleportZoneItem } from "../TeleportEditorScreen";
import { TeleportZoneSphere } from "./teleport-zone-sphere";
import { Group } from "three";

interface ModelViewerProps {
  scene: Group;
  isPlacementMode: boolean;
  hoverPoint: THREE.Vector3 | null;
  onPointerMove: (point: THREE.Vector3 | null) => void;
  onClick: () => void;
  teleportZones: TeleportZoneItem[];
  selectedTeleportZones: TeleportZoneItem[];
}

export function TeleportZoneModelViewer({
  scene,
  isPlacementMode,
  hoverPoint,
  onPointerMove,
  onClick,
  teleportZones,
  selectedTeleportZones,
}: ModelViewerProps) {
  const modelRef = useRef<THREE.Group>(null);

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isPlacementMode) return;
    event.stopPropagation();

    if (event.intersections.length > 0) {
      onPointerMove(event.intersections[0].point);
    } else {
      onPointerMove(null);
    }
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!isPlacementMode || !hoverPoint) return;
    event.stopPropagation();

    if (event.intersections.length > 0) {
      onClick();
    }
  };

  useEffect(() => {
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.userData.clickable = true;
        }
      });
    }
  }, [scene]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.6}
      />

      <group
        ref={modelRef}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        <primitive object={scene} />
      </group>

      {teleportZones.map((zone) => (
        <TeleportZoneSphere
          key={zone.name}
          position={[zone.x, zone.z, -zone.y]}
          isSelected={selectedTeleportZones.some((s) => s.name === zone.name)}
        />
      ))}

      {isPlacementMode && hoverPoint && (
        <TeleportZoneSphere
          position={[hoverPoint.x, hoverPoint.y, hoverPoint.z]}
          isPlaceholder
        />
      )}

      <OrbitControls enabled={!isPlacementMode} />
    </>
  );
}
