"use client";

import type { ThreeElements } from "@react-three/fiber";

import { getAvatarModelConfig } from "@/lib/virtual-fitting/avatar-models";

type GroupProps = ThreeElements["group"];

type Props = GroupProps & {
  heightScale?: number;
};

const SKIN = { color: "#c9b8a8", roughness: 0.62, metalness: 0.03 };
const HAIR = { color: "#2a2420", roughness: 0.9, metalness: 0.01 };

/** Altura total ~1.72 m; piezas alineadas sin solapar. */
const H = {
  footY: 0.03,
  legTop: 0.94,
  pelvisY: 1.02,
  torsoY: 1.22,
  shoulderY: 1.38,
  neckY: 1.5,
  headY: 1.63,
} as const;

export function FemaleBaseAvatar({ heightScale = 1, ...props }: Props) {
  const cfg = getAvatarModelConfig("female");
  const scale = heightScale * (cfg.targetHeight / 1.72);

  const legR = 0.06;
  const legLen = H.legTop - H.footY - legR * 2;
  const legMidY = H.footY + legR + legLen / 2;

  return (
    <group scale={scale} {...props}>
      {/* Piernas */}
      <mesh position={[-0.095, legMidY, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[legR, legLen, 10, 16]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      <mesh position={[0.095, legMidY, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[legR, legLen, 10, 16]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      <mesh position={[-0.095, H.footY, 0.05]} castShadow>
        <boxGeometry args={[0.065, 0.03, 0.16]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      <mesh position={[0.095, H.footY, 0.05]} castShadow>
        <boxGeometry args={[0.065, 0.03, 0.16]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>

      {/* Cadera / transición piernas–torso */}
      <mesh position={[0, H.pelvisY, 0]} scale={[1.2, 0.55, 0.85]} castShadow receiveShadow>
        <capsuleGeometry args={[0.1, 0.12, 10, 14]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>

      {/* Torso único (cintura → busto) */}
      <mesh position={[0, H.torsoY, 0]} scale={[0.92, 1, 0.8]} castShadow receiveShadow>
        <capsuleGeometry args={[0.115, 0.36, 14, 20]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>

      {/* Cuello y cabeza */}
      <mesh position={[0, H.neckY, 0]} castShadow>
        <capsuleGeometry args={[0.048, 0.07, 8, 12]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      <mesh position={[0, H.headY, 0.01]} castShadow receiveShadow>
        <sphereGeometry args={[0.098, 32, 32]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>

      {/* Brazos — unidos hombro → mano */}
      <group position={[-0.19, H.shoulderY, 0.02]} rotation={[0, 0, 0.55]}>
        <mesh position={[0, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.32, 8, 12]} />
          <meshStandardMaterial {...SKIN} />
        </mesh>
        <mesh position={[0, -0.33, 0]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial {...SKIN} />
        </mesh>
      </group>
      <group position={[0.19, H.shoulderY, 0.02]} rotation={[0, 0, -0.55]}>
        <mesh position={[0, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.32, 8, 12]} />
          <meshStandardMaterial {...SKIN} />
        </mesh>
        <mesh position={[0, -0.33, 0]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial {...SKIN} />
        </mesh>
      </group>

      {/* Cabello */}
      <group position={[0, H.headY, -0.05]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <sphereGeometry args={[0.102, 24, 24]} />
          <meshStandardMaterial {...HAIR} />
        </mesh>
        <mesh position={[0, -0.09, -0.1]} rotation={[0.18, 0, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.28, 8, 12]} />
          <meshStandardMaterial {...HAIR} />
        </mesh>
      </group>
    </group>
  );
}
