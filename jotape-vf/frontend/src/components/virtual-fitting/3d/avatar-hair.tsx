"use client";

import type { AvatarGender } from "@/types/virtual-fitting";

const HAIR = "#2c2420";

type Props = {
  gender: AvatarGender;
  headY: number;
  headRadius: number;
};

/** Cabello procedural (mujer). */
export function AvatarHair({ gender, headY, headRadius }: Props) {
  if (gender !== "female" || headRadius <= 0) return null;

  const r = headRadius;
  const y = headY;

  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, r * 0.28, -r * 0.12]} castShadow>
        <sphereGeometry args={[r * 1.06, 28, 28]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[0, -r * 0.35, -r * 0.62]} rotation={[0.2, 0, 0]} castShadow>
        <capsuleGeometry args={[r * 0.42, r * 1.45, 10, 16]} />
        <meshStandardMaterial color={HAIR} roughness={0.92} />
      </mesh>
      <mesh position={[-r * 0.72, -r * 0.15, -r * 0.2]} rotation={[0, 0, 0.22]} castShadow>
        <capsuleGeometry args={[r * 0.14, r * 0.75, 6, 10]} />
        <meshStandardMaterial color={HAIR} roughness={0.92} />
      </mesh>
      <mesh position={[r * 0.72, -r * 0.15, -r * 0.2]} rotation={[0, 0, -0.22]} castShadow>
        <capsuleGeometry args={[r * 0.14, r * 0.75, 6, 10]} />
        <meshStandardMaterial color={HAIR} roughness={0.92} />
      </mesh>
      <mesh position={[0, r * 0.05, r * 0.55]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[r * 1.1, r * 0.22, r * 0.18]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} />
      </mesh>
    </group>
  );
}
