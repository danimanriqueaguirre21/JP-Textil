"use client";

import type { ThreeElements } from "@react-three/fiber";

import { getAvatarProportions } from "@/lib/virtual-fitting/avatar-proportions";
import type { AvatarGender } from "@/types/virtual-fitting";

type GroupProps = ThreeElements["group"];

type Props = GroupProps & {
  gender: AvatarGender;
  scale?: number;
};

function LimbMaterial({ color, roughness = 0.55 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0.04} />;
}

/** Avatar humano procedural (hombre / mujer). Rostro detallado se añadirá después. */
export function HumanAvatar({ gender, scale = 1, ...props }: Props) {
  const p = getAvatarProportions(gender);
  const s = scale * p.bodyScale;

  const headY = 1.78 * s;
  const neckY = headY - p.headRadius * s - 0.04 * s;
  const torsoY = neckY - 0.08 * s - (p.torsoLength * s) / 2;
  const hipY = torsoY - (p.torsoLength * s) / 2 - 0.08 * s;
  const legTopY = hipY - 0.06 * s;

  const isFemale = gender === "female";

  return (
    <group scale={scale} {...props}>
      {/* Cabeza */}
      <mesh position={[0, headY, 0]} castShadow>
        <sphereGeometry args={[p.headRadius * s, 32, 32]} />
        <LimbMaterial color={p.skin} />
      </mesh>

      {/* Cuello */}
      <mesh position={[0, neckY, 0]} castShadow>
        <capsuleGeometry args={[p.neckRadius * s, 0.08 * s, 8, 12]} />
        <LimbMaterial color={p.skinShadow} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, torsoY, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[p.torsoRadius * s, p.torsoLength * s, 10, 16]} />
        <LimbMaterial color={p.skin} roughness={0.5} />
      </mesh>

      {/* Caderas (más marcadas en mujer) */}
      {isFemale ? (
        <>
          <mesh position={[-p.hipHalfWidth * s * 0.85, hipY, 0]} castShadow>
            <sphereGeometry args={[p.torsoRadius * s * 0.85, 16, 16]} />
            <LimbMaterial color={p.skin} />
          </mesh>
          <mesh position={[p.hipHalfWidth * s * 0.85, hipY, 0]} castShadow>
            <sphereGeometry args={[p.torsoRadius * s * 0.85, 16, 16]} />
            <LimbMaterial color={p.skin} />
          </mesh>
        </>
      ) : null}

      {/* Brazos */}
      <mesh
        position={[-p.shoulderHalfWidth * s, torsoY + 0.08 * s, 0]}
        rotation={[0, 0, 0.35]}
        castShadow
      >
        <capsuleGeometry args={[p.armRadius * s, p.armLength * s, 6, 12]} />
        <LimbMaterial color={p.skinShadow} />
      </mesh>
      <mesh
        position={[p.shoulderHalfWidth * s, torsoY + 0.08 * s, 0]}
        rotation={[0, 0, -0.35]}
        castShadow
      >
        <capsuleGeometry args={[p.armRadius * s, p.armLength * s, 6, 12]} />
        <LimbMaterial color={p.skinShadow} />
      </mesh>
      {/* Manos */}
      <mesh position={[-(p.shoulderHalfWidth + p.armLength * 0.85) * s, torsoY - 0.12 * s, 0]} castShadow>
        <sphereGeometry args={[p.armRadius * s * 1.1, 12, 12]} />
        <LimbMaterial color={p.skin} />
      </mesh>
      <mesh position={[(p.shoulderHalfWidth + p.armLength * 0.85) * s, torsoY - 0.12 * s, 0]} castShadow>
        <sphereGeometry args={[p.armRadius * s * 1.1, 12, 12]} />
        <LimbMaterial color={p.skin} />
      </mesh>

      {/* Piernas */}
      <mesh position={[-p.hipHalfWidth * s, legTopY - (p.legLength * s) / 2, 0]} castShadow>
        <capsuleGeometry args={[p.legRadius * s, p.legLength * s, 6, 12]} />
        <LimbMaterial color={p.skinShadow} />
      </mesh>
      <mesh position={[p.hipHalfWidth * s, legTopY - (p.legLength * s) / 2, 0]} castShadow>
        <capsuleGeometry args={[p.legRadius * s, p.legLength * s, 6, 12]} />
        <LimbMaterial color={p.skinShadow} />
      </mesh>
      {/* Pies */}
      <mesh position={[-p.hipHalfWidth * s, 0.04 * s, 0.04 * s]} castShadow>
        <boxGeometry args={[p.footWidth * s, 0.05 * s, 0.18 * s]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.7} />
      </mesh>
      <mesh position={[p.hipHalfWidth * s, 0.04 * s, 0.04 * s]} castShadow>
        <boxGeometry args={[p.footWidth * s, 0.05 * s, 0.18 * s]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.7} />
      </mesh>

      {/* Cabello — ayuda a distinguir género (sin rostro aún) */}
      {isFemale ? (
        <group position={[0, headY + 0.02 * s, -0.02 * s]}>
          <mesh position={[0, 0.04 * s, -0.06 * s]} castShadow>
            <sphereGeometry args={[p.headRadius * s * 1.05, 24, 24]} />
            <meshStandardMaterial color="#2a2520" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.08 * s, -0.12 * s]} rotation={[0.25, 0, 0]} castShadow>
            <capsuleGeometry args={[0.07 * s, 0.35 * s, 6, 10]} />
            <meshStandardMaterial color="#2a2520" roughness={0.9} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, headY + p.headRadius * s * 0.22, 0]} scale={[1, 0.5, 1]} castShadow>
          <sphereGeometry args={[p.headRadius * s * 1.02, 16, 16]} />
          <meshStandardMaterial color="#3d3835" roughness={0.85} />
        </mesh>
      )}

      {/* Base */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.32 * s, 32]} />
        <meshStandardMaterial color="#a1a1aa" roughness={0.85} />
      </mesh>
    </group>
  );
}
