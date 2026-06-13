"use client";

import { GltfAvatar } from "@/components/virtual-fitting/3d/gltf-avatar";
import type { NormalizedAvatarMeasurements } from "@/lib/body-scan/normalize-avatar-measurements";
import type { AvatarGender } from "@/types/virtual-fitting";

type Props = {
  gender: AvatarGender;
  heightScale?: number;
  widthScale?: number;
  depthScale?: number;
  zoneScales?: import("@/types/avatar-calibration").AvatarZoneScales;
  avatarCalibration?: import("@/types/avatar-calibration").AvatarCalibration;
  proportionsScale?: { x?: number; z?: number };
  garmentScale?: number;
  showGarment?: boolean;
};

/** Probador: avatar GLB + tshirt.glb + shorts.glb (ver GltfAvatar). */
export function AvatarView(props: Props) {
  return <GltfAvatar {...props} />;
}
