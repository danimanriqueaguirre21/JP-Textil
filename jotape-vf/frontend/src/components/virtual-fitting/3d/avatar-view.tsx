"use client";

import { GltfAvatar } from "@/components/virtual-fitting/3d/gltf-avatar";
import type { AvatarGender } from "@/types/virtual-fitting";

type Props = {
  gender: AvatarGender;
  heightScale?: number;
  garmentScale?: number;
  showGarment?: boolean;
};

/** Probador: avatar GLB + tshirt.glb + shorts.glb (ver GltfAvatar). */
export function AvatarView(props: Props) {
  return <GltfAvatar {...props} />;
}
