"use client";

import { GltfAvatar } from "@/components/virtual-fitting/3d/gltf-avatar";
import type { AvatarGender } from "@/types/virtual-fitting";

type Props = {
  gender: AvatarGender;
  heightScale?: number;
  garmentScale?: number;
};

/** Avatar 3D — debe renderizarse dentro de &lt;Canvas&gt; (p. ej. FittingScene). */
export function AvatarView({
  gender,
  heightScale = 1,
  garmentScale = 1,
}: Props) {
  return (
    <GltfAvatar
      gender={gender}
      heightScale={heightScale}
      garmentScale={garmentScale}
    />
  );
}
