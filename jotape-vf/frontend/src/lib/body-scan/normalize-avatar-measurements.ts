import { REFERENCE_ANTHRO } from "@/lib/body-scan/avatar-zone-scales";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";

/** Altura de referencia del probador (cm). */
export const BASE_HEIGHT_CM = 170;

const LIMITS = {
  heightCm: [120, 220] as const,
  chestCm: [50, 140] as const,
  waistCm: [45, 150] as const,
  hipCm: [50, 160] as const,
  shoulderCm: [30, 65] as const,
  armCm: [35, 90] as const,
  legCm: [50, 120] as const,
  depthCm: [18, 40] as const,
};

export type RawAvatarMeasurements = {
  heightCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  shoulderWidthCm?: number;
  hipWidthCm?: number;
  depthCm?: number;
  armLengthCm?: number;
  legLengthCm?: number;
};

export type NormalizedAvatarMeasurements = {
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  shoulderCm: number;
  armCm: number;
  legCm: number;
  depthCm: number;
  heightScale: number;
  widthScale: number;
  depthScale: number;
};

function clampRange(
  value: number,
  [min, max]: readonly [number, number],
  fallback: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  if (value > 0 && value < 8) return fallback;
  if (value < min * 0.35) return fallback;
  return Math.round(Math.min(max, Math.max(min, value)));
}

function estimateChestCm(shoulderCm: number): number {
  return Math.round(shoulderCm * 2.12 + 10);
}

function estimateWaistCm(
  shoulderCm: number,
  hipCm: number,
  rawWaist?: number,
): number {
  const prior = Math.round(shoulderCm * 1.48 + hipCm * 0.32);
  if (!rawWaist || rawWaist < LIMITS.waistCm[0]) {
    return clampRange(prior, LIMITS.waistCm, REFERENCE_ANTHRO.waist);
  }
  return clampRange(rawWaist, LIMITS.waistCm, prior);
}

function estimateHipCm(shoulderCm: number, heightCm: number, rawHip?: number): number {
  const fromHeight = Math.round(heightCm * 0.56);
  const raw = rawHip ?? fromHeight;
  const hip = clampRange(raw, LIMITS.hipCm, fromHeight);
  if (hip < shoulderCm * 0.95) return fromHeight;
  return hip;
}

/**
 * Valida cm, corrige valores normalizados/píxeles erróneos y calcula escalas del avatar.
 */
export function normalizeAvatarMeasurements(
  raw: RawAvatarMeasurements,
): NormalizedAvatarMeasurements {
  if (isBodyScanDiagnosticMode()) {
    return normalizeAvatarMeasurementsRaw(raw);
  }
  const heightCm = clampRange(
    raw.heightCm ?? BASE_HEIGHT_CM,
    LIMITS.heightCm,
    BASE_HEIGHT_CM,
  );

  const shoulderCm = clampRange(
    raw.shoulderWidthCm ?? REFERENCE_ANTHRO.shoulder,
    LIMITS.shoulderCm,
    REFERENCE_ANTHRO.shoulder,
  );

  const hipCm = estimateHipCm(shoulderCm, heightCm, raw.hipWidthCm);

  let chestCm = clampRange(raw.chestCm ?? 0, LIMITS.chestCm, 0);
  if (chestCm < LIMITS.chestCm[0]) {
    chestCm = estimateChestCm(shoulderCm);
  }

  const waistCm = estimateWaistCm(shoulderCm, hipCm, raw.waistCm);

  const depthCm = clampRange(
    raw.depthCm ?? Math.round(hipCm * 0.26),
    LIMITS.depthCm,
    REFERENCE_ANTHRO.depth,
  );

  const heightRatio = heightCm / REFERENCE_ANTHRO.height;
  const armCm = clampRange(
    raw.armLengthCm ?? 0,
    LIMITS.armCm,
    Math.round(REFERENCE_ANTHRO.arm * heightRatio),
  );
  const legCm = clampRange(
    raw.legLengthCm ?? 0,
    LIMITS.legCm,
    Math.round(REFERENCE_ANTHRO.leg * heightRatio),
  );

  const heightScale = heightCm / BASE_HEIGHT_CM;

  const widthScale = Math.min(
    1.18,
    Math.max(
      0.86,
      (shoulderCm / REFERENCE_ANTHRO.shoulder + chestCm / REFERENCE_ANTHRO.chest) /
        2,
    ),
  );

  const depthScale = Math.min(
    1.15,
    Math.max(
      0.88,
      (waistCm / REFERENCE_ANTHRO.waist +
        depthCm / REFERENCE_ANTHRO.depth +
        hipCm / REFERENCE_ANTHRO.hip) /
        3,
    ),
  );

  return {
    heightCm,
    chestCm,
    waistCm,
    hipCm,
    shoulderCm,
    armCm,
    legCm,
    depthCm,
    heightScale,
    widthScale,
    depthScale,
  };
}

/** Modo diagnóstico: pasa medidas tal cual, sin clamps ni estimaciones que suavicen. */
function normalizeAvatarMeasurementsRaw(
  raw: RawAvatarMeasurements,
): NormalizedAvatarMeasurements {
  const heightCm = raw.heightCm ?? BASE_HEIGHT_CM;
  const shoulderCm = raw.shoulderWidthCm ?? REFERENCE_ANTHRO.shoulder;
  const hipCm = raw.hipWidthCm ?? REFERENCE_ANTHRO.hip;
  const chestCm = raw.chestCm ?? Math.round(shoulderCm * 2.12 + 10);
  const waistCm = raw.waistCm ?? REFERENCE_ANTHRO.waist;
  const depthCm = raw.depthCm ?? REFERENCE_ANTHRO.depth;
  const heightRatio = heightCm / REFERENCE_ANTHRO.height;
  const armCm = raw.armLengthCm ?? Math.round(REFERENCE_ANTHRO.arm * heightRatio);
  const legCm = raw.legLengthCm ?? Math.round(REFERENCE_ANTHRO.leg * heightRatio);

  return {
    heightCm,
    chestCm,
    waistCm,
    hipCm,
    shoulderCm,
    armCm,
    legCm,
    depthCm,
    heightScale: heightCm / BASE_HEIGHT_CM,
    widthScale: (shoulderCm / REFERENCE_ANTHRO.shoulder + chestCm / REFERENCE_ANTHRO.chest) / 2,
    depthScale: (waistCm / REFERENCE_ANTHRO.waist + depthCm / REFERENCE_ANTHRO.depth + hipCm / REFERENCE_ANTHRO.hip) / 3,
  };
}

export function logAvatarCalibrationDebug(
  rawMeasurements: RawAvatarMeasurements,
  normalizedMeasurements: NormalizedAvatarMeasurements,
): void {
  if (typeof window === "undefined") return;
  console.table({
    rawHeightCm: rawMeasurements.heightCm,
    rawChestCm: rawMeasurements.chestCm,
    rawWaistCm: rawMeasurements.waistCm,
    rawHipCm: rawMeasurements.hipWidthCm,
    rawShoulderCm: rawMeasurements.shoulderWidthCm,
    normalizedHeightCm: normalizedMeasurements.heightCm,
    normalizedChestCm: normalizedMeasurements.chestCm,
    normalizedWaistCm: normalizedMeasurements.waistCm,
    normalizedHipCm: normalizedMeasurements.hipCm,
    heightScale: normalizedMeasurements.heightScale,
    widthScale: normalizedMeasurements.widthScale,
    depthScale: normalizedMeasurements.depthScale,
  });
}
