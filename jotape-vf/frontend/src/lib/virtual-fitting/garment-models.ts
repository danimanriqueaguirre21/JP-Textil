import type { AvatarGender } from "@/types/virtual-fitting";

export const GARMENT_TSHIRT_GLB = "/models/garments/tshirt.glb";
export const GARMENT_SHORTS_GLB = "/models/garments/shorts.glb";

export const DEFAULT_OUTFIT_COLORS = {
  tshirt: "#F2F2F2",
  shorts: "#F0F0F0",
} as const;

export type GarmentFitProfile = {
  ease: number;
  offset: number;
};

/** Región del cuerpo (fracciones de altura del mesh) donde encaja cada prenda. */
export type GarmentBodyRegion = {
  rootName: string;
  yMinRatio: number;
  yMaxRatio: number;
  /** Tope absoluto (ratio altura) para no subir a la cabeza si el mesh incluye rostro. */
  yMaxCapRatio?: number;
  widthPad: number;
  depthPad: number;
  heightPad: number;
  coreHalfWidthFactor: number;
  minDepthToHeight: number;
  maxWidthToHeight: number;
  maxDepthToHeight: number;
};

const TSHIRT_BASE: Omit<
  GarmentBodyRegion,
  "rootName" | "yMinRatio" | "yMaxRatio" | "yMaxCapRatio"
> = {
  widthPad: 1.02,
  depthPad: 1.22,
  heightPad: 1.0,
  coreHalfWidthFactor: 0.2,
  minDepthToHeight: 0.2,
  maxWidthToHeight: 0.44,
  maxDepthToHeight: 0.4,
};

const SHORTS_BASE: Omit<GarmentBodyRegion, "rootName" | "yMinRatio" | "yMaxRatio"> = {
  widthPad: 1.1,
  depthPad: 1.2,
  heightPad: 1.02,
  coreHalfWidthFactor: 0.22,
  minDepthToHeight: 0.2,
  maxWidthToHeight: 0.54,
  maxDepthToHeight: 0.42,
};

/** Posición vertical por género (más alto = cubre hombros/pecho superior). */
export const GARMENT_BODY_REGION_BY_GENDER: Record<
  AvatarGender,
  Record<"tshirt" | "shorts", GarmentBodyRegion>
> = {
  male: {
    tshirt: {
      rootName: "vf-garment-tshirt",
      yMinRatio: 0.5,
      yMaxRatio: 0.84,
      yMaxCapRatio: 0.82,
      ...TSHIRT_BASE,
    },
    shorts: {
      rootName: "vf-garment-shorts",
      yMinRatio: 0.42,
      yMaxRatio: 0.56,
      ...SHORTS_BASE,
    },
  },
  female: {
    tshirt: {
      rootName: "vf-garment-tshirt",
      yMinRatio: 0.52,
      yMaxRatio: 0.85,
      yMaxCapRatio: 0.83,
      ...TSHIRT_BASE,
      coreHalfWidthFactor: 0.18,
      maxWidthToHeight: 0.42,
    },
    shorts: {
      rootName: "vf-garment-shorts",
      yMinRatio: 0.43,
      yMaxRatio: 0.57,
      ...SHORTS_BASE,
      coreHalfWidthFactor: 0.2,
      maxWidthToHeight: 0.5,
    },
  },
};

/** @deprecated Usar garmentBodyRegion(gender, slot). */
export const GARMENT_BODY_REGION = GARMENT_BODY_REGION_BY_GENDER.male;

export function garmentBodyRegion(
  gender: AvatarGender,
  slot: "tshirt" | "shorts",
): GarmentBodyRegion {
  return GARMENT_BODY_REGION_BY_GENDER[gender][slot];
}

export const GARMENT_FIT: Record<AvatarGender, GarmentFitProfile> = {
  male: { ease: 1.02, offset: 0 },
  female: { ease: 1.0, offset: 0 },
};

export function garmentFitProfile(
  gender: AvatarGender,
  sizeScale: number,
): GarmentFitProfile {
  const base = GARMENT_FIT[gender];
  return {
    ease: base.ease * (0.97 + sizeScale * 0.05),
    offset: base.offset,
  };
}
