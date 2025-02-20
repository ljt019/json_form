import { Sphere } from "@react-three/drei";

interface TeleportZoneMarkerProps {
  position: [number, number, number];
  isSelected?: boolean;
  isPlaceholder?: boolean;
}

export function TeleportZoneMarker({
  position,
  isSelected,
  isPlaceholder,
}: TeleportZoneMarkerProps) {
  return (
    <Sphere position={position} args={[0.1, 32, 32]}>
      <meshStandardMaterial
        color={isPlaceholder ? "#00ff00" : isSelected ? "#ff0000" : "#0000ff"}
        emissive={isSelected ? "#ff0000" : "#0000ff"}
        emissiveIntensity={isSelected ? 0.5 : 0}
        opacity={isPlaceholder ? 0.5 : 1}
        transparent={isPlaceholder}
      />
    </Sphere>
  );
}
