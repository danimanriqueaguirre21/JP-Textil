import type { ProportionalAvatarScales, ProportionalScaleDebug } from "@/types/proportional-scales";
import type { BodyType, HybridBodyDiagnostics } from "@/types/hybrid-body-scan";
import type { AvatarGender } from "@/types/virtual-fitting";

/** Escalas por zona corporal (1 = referencia adulto M ~170 cm). */
export type AvatarZoneScales = {
  shoulder: number;
  chest: number;
  waist: number;
  hip: number;
  depth: number;
  arm: number;
  leg: number;
  neck: number;
};

/** Calibración aplicada al avatar 3D y al recomendador de talla. */
export type AvatarCalibration = {
  heightCm: number;
  weightKg: number;
  shoulderWidthCm: number;
  hipWidthCm: number;
  waistCm: number;
  chestCm: number;
  depthCm: number;
  armLengthCm: number;
  legLengthCm: number;
  torsoLengthCm: number;
  gender: AvatarGender;
  /** @deprecated Usar zoneScales.shoulder — mantenido por compatibilidad. */
  widthScale: number;
  /** @deprecated Usar zoneScales.depth */
  depthScale: number;
  zoneScales: AvatarZoneScales;
  /** Escalas proporcionales suaves (fotos front/side). */
  proportionalScales?: ProportionalAvatarScales;
  proportionalScaleDebug?: ProportionalScaleDebug;
  /** Vista lateral disponible al escanear. */
  hasSideView?: boolean;
  /** Clasificación corporal híbrida (segmentación + pose). */
  bodyType?: BodyType;
  bodyFatEstimate?: number;
  abdomenDepthCm?: number;
  thighWidthCm?: number;
  hybridDiagnostics?: HybridBodyDiagnostics;
  circumferenceDiagnostic?: import("@/lib/body-scan/fuse-measurements").CircumferenceDiagnostic;
  poseQuality: number;
  sessionId?: string;
  source: "body_scan" | "manual";
  updatedAt: string;
};

export type FusedBodyMeasurements = {
  heightCm: number;
  shoulderWidthCm: number;
  hipWidthCm: number;
  waistCm: number;
  chestCm: number;
  depthCm: number;
  armLengthCm: number;
  legLengthCm: number;
  torsoLengthCm: number;
  poseQuality: number;
  abdomenDepthCm?: number;
  thighWidthCm?: number;
  bodyFatEstimate?: number;
  bodyType?: BodyType;
  segmentationUsed?: boolean;
  circumferenceDiagnostic?: import("@/lib/body-scan/fuse-measurements").CircumferenceDiagnostic;
};
