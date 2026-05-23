"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import type { Group, PerspectiveCamera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import {
  computeCanonicalAvatarCameraFrame,
  FITTING_VIEW,
} from "@/lib/virtual-fitting/fit-avatar-camera";
import type { AvatarGender } from "@/types/virtual-fitting";

type Props = {
  root: Group | null;
  gender: AvatarGender;
  heightScale: number;
};

/** Encuadre fijo probador (misma escala visual hombre/mujer). */
export function AvatarCameraFit({ root, gender, heightScale }: Props) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree(
    (s) => s.controls as OrbitControlsImpl | undefined,
  );

  useLayoutEffect(() => {
    if (!root || !("fov" in camera)) return;
    const persp = camera as PerspectiveCamera;
    const aspect = size.width > 0 ? size.width / size.height : 1;
    const frame = computeCanonicalAvatarCameraFrame(
      gender,
      heightScale,
      persp,
      aspect,
    );

    persp.position.set(0, frame.centerY, frame.distance);
    persp.lookAt(0, frame.centerY, 0);
    persp.updateProjectionMatrix();

    if (controls) {
      controls.target.set(0, frame.centerY, 0);
      controls.minDistance = frame.distance * 0.88;
      controls.maxDistance = frame.distance * 1.18;
      controls.update();
    }
  }, [root, gender, heightScale, camera, size.width, size.height, controls]);

  return null;
}

export { FITTING_VIEW };
