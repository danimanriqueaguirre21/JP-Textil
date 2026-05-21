"use client";

import { OrbitControls } from "@react-three/drei";

/** Rotación manual (ratón / táctil). Sin auto-giro. */
export function FittingOrbitControls() {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={12}
      minPolarAngle={Math.PI / 10}
      maxPolarAngle={Math.PI / 1.9}
      touches={{
        ONE: 0,
        TWO: 2,
      }}
    />
  );
}
