"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useLayoutEffect, useRef } from "react";
import { Box3, Group, PerspectiveCamera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { ReactNode } from "react";

import { fitCameraToBox } from "@/lib/virtual-fitting/fit-camera-to-box";
import type { AvatarGender } from "@/types/virtual-fitting";

type Props = {
  gender: AvatarGender;
  children: ReactNode;
};

const MIN_HEIGHT: Record<AvatarGender, number> = {
  male: 1.5,
  female: 1.3,
};

export function AvatarCameraFit({ gender, children }: Props) {
  const groupRef = useRef<Group>(null);
  const { camera, controls, size, invalidate } = useThree();
  const stableFrames = useRef(0);
  const lastHeight = useRef(0);

  const fit = useCallback(() => {
    const group = groupRef.current;
    const orbit = controls as OrbitControlsImpl | null;
    if (!group || !orbit) return false;

    const box = new Box3().setFromObject(group);
    const height = box.max.y - box.min.y;
    if (height < MIN_HEIGHT[gender]) return false;

    const aspect = size.width > 0 && size.height > 0 ? size.width / size.height : 1;
    const isMale = gender === "male";

    fitCameraToBox(
      box,
      camera as PerspectiveCamera,
      orbit,
      aspect,
      isMale ? 1.52 : 1.46,
      { bottomPad: isMale ? 0.26 : 0.22, topPad: isMale ? 0.1 : 0.08 },
    );
    invalidate();
    return true;
  }, [camera, controls, gender, invalidate, size.height, size.width]);

  useLayoutEffect(() => {
    stableFrames.current = 0;
    lastHeight.current = 0;
    fit();
    const t1 = window.setTimeout(fit, 80);
    const t2 = window.setTimeout(fit, 250);
    const t3 = window.setTimeout(fit, 600);
    const t4 = window.setTimeout(fit, 1200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [fit, gender]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const box = new Box3().setFromObject(group);
    const height = box.max.y - box.min.y;
    if (height < MIN_HEIGHT[gender]) return;

    if (Math.abs(height - lastHeight.current) > 0.03) {
      lastHeight.current = height;
      stableFrames.current = 0;
      fit();
      return;
    }

    if (stableFrames.current < 3) {
      stableFrames.current += 1;
      fit();
    }
  });

  return <group ref={groupRef}>{children}</group>;
}
