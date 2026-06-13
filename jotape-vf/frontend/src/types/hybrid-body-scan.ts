/** Clasificación corporal para ajuste del avatar. */
export type BodyType =
  | "SLIM"
  | "AVERAGE"
  | "ATHLETIC"
  | "OVERWEIGHT"
  | "OBESE";

/** Calibración altura real → píxeles (fase 1). */
export type HeightCalibration = {
  heightCm: number;
  pixelHeight: number;
  cmPerPixel: number;
};

/** Medidas extraídas de la máscara de segmentación por banda corporal. */
export type SegmentationBandMeasures = {
  shoulderWidthCm: number;
  chestWidthCm: number;
  waistWidthCm: number;
  abdomenWidthCm: number;
  hipWidthCm: number;
  thighWidthCm: number;
  /** Solo vista lateral. */
  chestDepthCm?: number;
  abdomenDepthCm?: number;
  hipDepthCm?: number;
  gluteDepthCm?: number;
  /** 0–1 cobertura útil de la máscara. */
  maskQuality: number;
  debug?: import("@/lib/body-scan/extract-segmentation-measures").SegmentationExtractDebug;
};

/** Estimación corporal fusionada (fase 3–4). */
export type HybridBodyEstimate = {
  chestCm: number;
  waistCm: number;
  hipCm: number;
  depthCm: number;
  abdomenDepthCm: number;
  thighWidthCm: number;
  bodyFatEstimate: number;
  bodyType: BodyType;
};

/** Panel de diagnóstico (fase 6). */
export type HybridBodyDiagnostics = {
  heightCm: number;
  pixelHeight?: number;
  cmPerPixel?: number;
  chestEstimatedCm: number;
  waistEstimatedCm: number;
  hipEstimatedCm: number;
  abdomenDepthCm: number;
  bodyFatEstimate: number;
  bodyType: BodyType;
  avatarScales?: Record<string, number>;
  segmentationUsed: boolean;
  hasSideView: boolean;
};
