import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface RotatingPrimitiveProps {
  object: THREE.Object3D;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotationSpeed?: number;
}

/**
 * RotatingPrimitive clones the provided object, applies optional
 * scale and position, and rotates it continuously.
 */
export function RotatingPrimitive({
  object,
  scale = [3, 3, 3],
  position = [0, 0, 0],
  rotationSpeed = 0.005,
}: RotatingPrimitiveProps) {
  const ref = useRef<THREE.Object3D>(null);
  const clonedObject = useMemo(() => object.clone(), [object]);

  useEffect(() => {
    if (ref.current) {
      ref.current.scale.set(scale[0], scale[1], scale[2]);
      ref.current.position.set(position[0], position[1], position[2]);
    }
  }, [scale, position]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += rotationSpeed;
    }
  });

  return <primitive ref={ref} object={clonedObject} />;
}
