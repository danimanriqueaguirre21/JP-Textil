import { Group, Mesh } from "three";

import { CLOTHING_NORMAL_INFLATE } from "@/lib/clothing/clothing-offsets";
import type { ClothingSlot } from "@/lib/clothing/clothing-offsets";
import { inflateMeshGeometry } from "@/lib/clothing/inflate-mesh-geometry";
import type { AvatarGender } from "@/types/virtual-fitting";

export function inflateClothingGroup(
  root: Group,
  gender: AvatarGender,
  slot: ClothingSlot,
): void {
  const amount = CLOTHING_NORMAL_INFLATE[gender][slot];
  if (amount <= 0) return;

  root.traverse((node) => {
    if (!(node instanceof Mesh) || !node.geometry) return;
    inflateMeshGeometry(node.geometry, amount);
  });
}
