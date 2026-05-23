import {
  CLOTHING_SHORTS_GLB,
  CLOTHING_TSHIRT_GLB,
} from "@/lib/clothing/clothing-paths";
import type { AvatarGender } from "@/types/virtual-fitting";

/** Rutas canónicas de ropa (solo GLB reales en `/models/clothing/`). */
export const GARMENT_TSHIRT_GLB = CLOTHING_TSHIRT_GLB;
export const GARMENT_POLO_GLB = "/models/clothing/hoodie.glb";
export const GARMENT_SHORTS_GLB = CLOTHING_SHORTS_GLB;

export type GarmentTopKind = "tshirt" | "polo";

const GARMENT_TOP_GLB: Record<GarmentTopKind, string> = {
  tshirt: GARMENT_TSHIRT_GLB,
  polo: GARMENT_POLO_GLB,
};

export function garmentTopGlbUrl(kind: GarmentTopKind = "tshirt"): string {
  return GARMENT_TOP_GLB[kind];
}

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
      yMaxRatio: 0.74,
      yMaxCapRatio: 0.72,
      ...TSHIRT_BASE,
    },
    shorts: {
      rootName: "vf-garment-shorts",
      yMinRatio: 0.34,
      yMaxRatio: 0.48,
      ...SHORTS_BASE,
    },
  },
  female: {
    tshirt: {
      rootName: "vf-garment-tshirt",
      yMinRatio: 0.5,
      yMaxRatio: 0.86,
      yMaxCapRatio: 0.84,
      ...TSHIRT_BASE,
      widthPad: 1.08,
      depthPad: 1.28,
      coreHalfWidthFactor: 0.17,
      maxWidthToHeight: 0.48,
    },
    shorts: {
      rootName: "vf-garment-shorts",
      yMinRatio: 0.4,
      yMaxRatio: 0.58,
      ...SHORTS_BASE,
      widthPad: 1.14,
      depthPad: 1.28,
      coreHalfWidthFactor: 0.24,
      maxWidthToHeight: 0.56,
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
  /** Más holgura al encajar por bbox (prenda masculina sobre cuerpo femenino). */
  female: { ease: 1.08, offset: 0 },
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
