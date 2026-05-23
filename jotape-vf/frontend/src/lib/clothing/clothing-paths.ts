import type { AvatarGender } from "@/types/virtual-fitting";

import type { ClothingSlot } from "./clothing-offsets";

/** Prendas GLB reales — exportadas desde el avatar del mismo género. */
export const CLOTHING_TSHIRT_GLB_MALE = "/models/clothing/tshirt.glb";
/** Borrador para aprobar antes de reemplazar tshirt.glb */
export const CLOTHING_TSHIRT_GLB_PREVIEW = "/models/clothing/tshirt-preview.glb";
export const CLOTHING_SHORTS_GLB_MALE = "/models/clothing/shorts.glb";
export const CLOTHING_TSHIRT_GLB_FEMALE = "/models/clothing/tshirt-female.glb";
export const CLOTHING_SHORTS_GLB_FEMALE = "/models/clothing/shorts-female.glb";

/** @deprecated Usar getClothingGlbUrl(gender, slot) */
export const CLOTHING_TSHIRT_GLB = CLOTHING_TSHIRT_GLB_MALE;
/** @deprecated Usar getClothingGlbUrl(gender, slot) */
export const CLOTHING_SHORTS_GLB = CLOTHING_SHORTS_GLB_MALE;

export function getClothingGlbUrl(
  gender: AvatarGender,
  slot: ClothingSlot,
): string {
  if (slot === "tshirt") {
    return gender === "female"
      ? CLOTHING_TSHIRT_GLB_FEMALE
      : CLOTHING_TSHIRT_GLB_MALE;
  }
  return gender === "female"
    ? CLOTHING_SHORTS_GLB_FEMALE
    : CLOTHING_SHORTS_GLB_MALE;
}

export const ALL_CLOTHING_GLBS = [
  CLOTHING_TSHIRT_GLB_MALE,
  CLOTHING_SHORTS_GLB_MALE,
  CLOTHING_TSHIRT_GLB_FEMALE,
  CLOTHING_SHORTS_GLB_FEMALE,
] as const;

export const DEFAULT_OUTFIT_GLBS = ALL_CLOTHING_GLBS;
