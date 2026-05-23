import type { AvatarGender } from "@/types/virtual-fitting";

export type ClothingSlot = "tshirt" | "shorts";

export type ClothingOffset = {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  /** Solo con topAnchor: baja el borde superior respecto a hombros/cintura (m). */
  topInset?: number;
};

/**
 * export = coords del GLB sin mover.
 * torsoAnchor = centro de la región del torso/cadera.
 * topAnchor = borde superior de la prenda en hombros (polo) o cintura (short).
 */
export type ClothingAlignMode = "export" | "center" | "torsoAnchor" | "topAnchor";

export type ClothingOffsetsByGender = Record<
  AvatarGender,
  Record<ClothingSlot, ClothingOffset>
>;

export const CLOTHING_ALIGN_MODE: Record<
  AvatarGender,
  Record<ClothingSlot, ClothingAlignMode>
> = {
  male: { tshirt: "topAnchor", shorts: "topAnchor" },
  female: { tshirt: "export", shorts: "export" },
};

export const CLOTHING_NORMAL_INFLATE: Record<
  AvatarGender,
  Record<ClothingSlot, number>
> = {
  /** Inflate bajo: en malla extraída, valores altos abren huecos en la espalda. */
  male: { tshirt: 0.004, shorts: 0.008 },
  female: { tshirt: 0.01, shorts: 0.01 },
};

export const clothingOffsets: ClothingOffsetsByGender = {
  /** Hombre + topAnchor: afinado en /try-on (male.glb + clothing/*.glb). */
  male: {
    /** position [X,Y,Z] metros tras anclar hombros/cintura; topInset baja el borde superior. */
    tshirt: {
      position: [0, 0.25, 0.02],
      scale: [1.06, 1.08, 1.05],
      rotation: [0, 0, 0],
      topInset: 0.06,
    },
    shorts: {
      position: [0, 0.17, -0.01],
      scale: [1.04, 1.02, 1.04],
      rotation: [0, 0, 0],
      topInset: 0.015,
    },
  },
  female: {
    tshirt: {
      position: [0, 0, -0.008],
      scale: [1.03, 1.03, 1.04],
      rotation: [0, 0, 0],
    },
    shorts: {
      position: [0, -0.008, -0.008],
      scale: [1.04, 1.01, 1.04],
      rotation: [0, 0, 0],
    },
  },
};

export function getClothingOffset(
  gender: AvatarGender,
  slot: ClothingSlot,
): ClothingOffset {
  return clothingOffsets[gender][slot];
}

export function getClothingAlignMode(
  gender: AvatarGender,
  slot: ClothingSlot,
): ClothingAlignMode {
  return CLOTHING_ALIGN_MODE[gender][slot];
}
