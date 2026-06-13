import type { AvatarCalibration } from "@/types/avatar-calibration";
import type { FusedBodyMeasurements } from "@/types/avatar-calibration";
import type { AvatarGender } from "@/types/virtual-fitting";
import type { BodyProfile } from "@/types/body-profile";

import { computeAvatarZoneScales } from "@/lib/body-scan/avatar-zone-scales";
import { computeProportionalScales } from "@/lib/body-scan/compute-proportional-scales";
import {
  normalizeAvatarMeasurements,
  type RawAvatarMeasurements,
} from "@/lib/body-scan/normalize-avatar-measurements";
import { logMeasurementPipelineDebug } from "@/lib/body-scan/resolve-display-measurements";

const STORAGE_KEY = "jotape-avatar-calibration-v3";

export const CALIBRATION_UPDATED_EVENT = "jotape-avatar-calibration-updated";

const LEGACY_KEYS = [
  "jotape-avatar-calibration-v2",
  "jotape-avatar-calibration-v1",
] as const;

function fusedToRaw(
  fused: FusedBodyMeasurements,
  profile: BodyProfile,
): RawAvatarMeasurements {
  return {
    heightCm: profile.heightCm > 0 ? profile.heightCm : fused.heightCm,
    chestCm: fused.chestCm,
    waistCm: fused.waistCm,
    hipWidthCm: fused.hipWidthCm,
    shoulderWidthCm: fused.shoulderWidthCm,
    depthCm: fused.depthCm,
    armLengthCm: fused.armLengthCm,
    legLengthCm: fused.legLengthCm,
  };
}

function normalizedToFused(
  n: ReturnType<typeof normalizeAvatarMeasurements>,
  poseQuality: number,
): FusedBodyMeasurements {
  return {
    heightCm: n.heightCm,
    shoulderWidthCm: n.shoulderCm,
    hipWidthCm: n.hipCm,
    waistCm: n.waistCm,
    chestCm: n.chestCm,
    depthCm: n.depthCm,
    armLengthCm: n.armCm,
    legLengthCm: n.legCm,
    torsoLengthCm: Math.round(n.heightCm * 0.28),
    poseQuality,
  };
}

export function buildAvatarCalibration(
  fused: FusedBodyMeasurements,
  profile: BodyProfile,
  options?: {
    gender?: AvatarGender;
    sessionId?: string;
    source?: AvatarCalibration["source"];
    hasSideView?: boolean;
  },
): AvatarCalibration {
  const raw = fusedToRaw(fused, profile);
  const normalized = normalizeAvatarMeasurements(raw);
  logMeasurementPipelineDebug({
    fused,
    raw,
    human: normalized,
    technical: null,
  });

  const fusedClean = normalizedToFused(normalized, fused.poseQuality);
  fusedClean.torsoLengthCm = fused.torsoLengthCm || fusedClean.torsoLengthCm;
  const zoneScales = computeAvatarZoneScales(fusedClean);
  const hasSideView = options?.hasSideView ?? false;
  const { scales: proportionalScales, debug: proportionalScaleDebug } =
    computeProportionalScales({
      heightCm: normalized.heightCm,
      shoulderWidthCm: normalized.shoulderCm,
      chestCm: normalized.chestCm,
      waistCm: normalized.waistCm,
      hipWidthCm: normalized.hipCm,
      depthCm: normalized.depthCm,
      abdomenDepthCm: fused.abdomenDepthCm,
      thighWidthCm: fused.thighWidthCm,
      torsoLengthCm: fusedClean.torsoLengthCm,
      legLengthCm: normalized.legCm,
      poseQuality: fused.poseQuality,
      hasSideView,
      bodyType: fused.bodyType,
      bodyFatEstimate: fused.bodyFatEstimate,
      segmentationUsed: fused.segmentationUsed,
    });

  const hybridDiagnostics = {
    heightCm: normalized.heightCm,
    chestEstimatedCm: normalized.chestCm,
    waistEstimatedCm: normalized.waistCm,
    hipEstimatedCm: normalized.hipCm,
    abdomenDepthCm: fused.abdomenDepthCm ?? normalized.depthCm,
    bodyFatEstimate: fused.bodyFatEstimate ?? 0,
    bodyType: fused.bodyType ?? "AVERAGE",
    avatarScales: proportionalScales as unknown as Record<string, number>,
    segmentationUsed: fused.segmentationUsed ?? false,
    hasSideView,
  };

  return {
    heightCm: normalized.heightCm,
    weightKg: profile.weightKg,
    shoulderWidthCm: normalized.shoulderCm,
    hipWidthCm: normalized.hipCm,
    waistCm: normalized.waistCm,
    chestCm: normalized.chestCm,
    depthCm: normalized.depthCm,
    armLengthCm: normalized.armCm,
    legLengthCm: normalized.legCm,
    torsoLengthCm: fusedClean.torsoLengthCm,
    gender: options?.gender ?? "male",
    widthScale: normalized.widthScale,
    depthScale: normalized.depthScale,
    zoneScales,
    proportionalScales,
    proportionalScaleDebug,
    hasSideView,
    bodyType: fused.bodyType,
    bodyFatEstimate: fused.bodyFatEstimate,
    abdomenDepthCm: fused.abdomenDepthCm,
    thighWidthCm: fused.thighWidthCm,
    hybridDiagnostics,
    poseQuality: fused.poseQuality,
    sessionId: options?.sessionId,
    source: options?.source ?? "body_scan",
    updatedAt: new Date().toISOString(),
  };
}

function migrateLegacy(raw: AvatarCalibration): AvatarCalibration {
  const normalized = normalizeAvatarMeasurements({
    heightCm: raw.heightCm,
    chestCm: raw.chestCm,
    waistCm: raw.waistCm,
    hipWidthCm: raw.hipWidthCm,
    shoulderWidthCm: raw.shoulderWidthCm,
    depthCm: raw.depthCm,
    armLengthCm: raw.armLengthCm,
    legLengthCm: raw.legLengthCm,
  });

  const fusedClean = normalizedToFused(normalized, raw.poseQuality);
  const zoneScales = computeAvatarZoneScales(fusedClean);
  const { scales: proportionalScales, debug: proportionalScaleDebug } =
    computeProportionalScales({
      heightCm: normalized.heightCm,
      shoulderWidthCm: normalized.shoulderCm,
      chestCm: normalized.chestCm,
      waistCm: normalized.waistCm,
      hipWidthCm: normalized.hipCm,
      depthCm: normalized.depthCm,
      abdomenDepthCm: raw.abdomenDepthCm,
      thighWidthCm: raw.thighWidthCm,
      torsoLengthCm: raw.torsoLengthCm ?? fusedClean.torsoLengthCm,
      legLengthCm: normalized.legCm,
      poseQuality: raw.poseQuality,
      hasSideView: raw.hasSideView ?? false,
      bodyType: raw.bodyType,
      bodyFatEstimate: raw.bodyFatEstimate,
      segmentationUsed: raw.hybridDiagnostics?.segmentationUsed,
    });

  return {
    ...raw,
    heightCm: normalized.heightCm,
    shoulderWidthCm: normalized.shoulderCm,
    hipWidthCm: normalized.hipCm,
    waistCm: normalized.waistCm,
    chestCm: normalized.chestCm,
    depthCm: normalized.depthCm,
    armLengthCm: normalized.armCm,
    legLengthCm: normalized.legCm,
    widthScale: normalized.widthScale,
    depthScale: normalized.depthScale,
    zoneScales,
    proportionalScales,
    proportionalScaleDebug,
  };
}

export function loadAvatarCalibration(): AvatarCalibration | null {
  if (typeof window === "undefined") return null;
  try {
    let raw: string | null = null;
    for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
      raw = localStorage.getItem(key);
      if (raw) break;
    }
    if (!raw) return null;
    const parsed = migrateLegacy(JSON.parse(raw) as AvatarCalibration);
    const human = normalizeAvatarMeasurements(parsed);
    logMeasurementPipelineDebug({
      fused: null,
      raw: parsed,
      human,
      technical: null,
    });
    return parsed;
  } catch {
    return null;
  }
}

export function saveAvatarCalibration(calibration: AvatarCalibration): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration));
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new CustomEvent(CALIBRATION_UPDATED_EVENT));
}

export function clearAvatarCalibration(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new CustomEvent(CALIBRATION_UPDATED_EVENT));
}
