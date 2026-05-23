"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";

import { prepareClothingScene } from "@/lib/clothing/prepare-clothing-scene";

type GroupTransform = Pick<ThreeElements["group"], "position" | "rotation" | "scale">;

type Props = GroupTransform & {
  url: string;
  color?: string;
  visible?: boolean;
};

/**
 * Prenda GLB real: solo useGLTF + clone. Sin Box/Capsule/RoundedBox ni encaje por bbox.
 */
export function ClothingModel({
  url,
  color = "#f2f2f2",
  visible = true,
  position,
  rotation,
  scale,
}: Props) {
  const { scene } = useGLTF(url);
  const model = useMemo(
    () => prepareClothingScene(scene, color),
    [scene, color],
  );

  if (!visible) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={model} />
    </group>
  );
}
