"use client";

import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { BASE_HEIGHT_CM } from "@/lib/body-scan/normalize-avatar-measurements";
import { getAvatarModelConfig } from "@/lib/virtual-fitting/avatar-models";

type Props = {
  gender: "male" | "female";
  heightCm: number;
  heightScale: number;
};

const REF_LINES = [
  { cm: 150, color: "#f59e0b" },
  { cm: 170, color: "#22c55e" },
  { cm: 180, color: "#3b82f6" },
] as const;

/**
 * Marcas de altura en el probador (solo debug).
 * Activar con NEXT_PUBLIC_AVATAR_CALIBRATION_DEBUG=true
 */
export function AvatarHeightDebug({ gender, heightCm, heightScale }: Props) {
  const config = getAvatarModelConfig(gender);
  const userHeightM = config.targetHeight * heightScale;

  const markers = useMemo(() => {
    return REF_LINES.map(({ cm, color }) => {
      const scale = cm / BASE_HEIGHT_CM;
      const y = config.targetHeight * scale;
      const points: [THREE.Vector3, THREE.Vector3] = [
        new THREE.Vector3(-0.55, y, 0),
        new THREE.Vector3(0.55, y, 0),
      ];
      return { cm, color, y, points };
    });
  }, [config.targetHeight]);

  const userLine: [THREE.Vector3, THREE.Vector3] = useMemo(
    () => [
      new THREE.Vector3(-0.35, 0, 0.02),
      new THREE.Vector3(-0.35, userHeightM, 0.02),
    ],
    [userHeightM],
  );

  return (
    <group>
      {markers.map((m) => (
        <group key={m.cm}>
          <Line points={m.points} color={m.color} lineWidth={2} />
          <Html position={[0.58, m.y, 0]} center style={{ pointerEvents: "none" }}>
            <span
              className="rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-white"
              style={{ color: m.color }}
            >
              {m.cm} cm ref
            </span>
          </Html>
        </group>
      ))}
      <Line points={userLine} color="#ec4899" lineWidth={3} />
      <Html position={[-0.42, userHeightM, 0]} center style={{ pointerEvents: "none" }}>
        <span className="rounded bg-pink-600/90 px-1.5 py-0.5 text-[9px] font-mono text-white">
          {heightCm} cm ({heightScale.toFixed(2)}×)
        </span>
      </Html>
    </group>
  );
}
