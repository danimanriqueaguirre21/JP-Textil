import type { NormalizedAvatarMeasurements } from "@/lib/body-scan/normalize-avatar-measurements";
import { REFERENCE_ANTHRO } from "@/lib/body-scan/avatar-zone-scales";
import {
  bodyFatToPreset,
  buildAnatomicalVolumeScales,
} from "@/lib/virtual-fitting/body-volume-anatomy";
import type { AnatomicalVolumeScales, BodyVolumeParams } from "@/types/body-volume";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * bodyFat desde cintura/pecho (perfil robusto).
 * muscle solo si el torso no es predominantemente graso.
 */
export function computeBodyVolumeParams(
  m: NormalizedAvatarMeasurements,
): BodyVolumeParams {
  const heightCm = Math.max(m.heightCm, 120);
  const waistRatio = m.waistCm / REFERENCE_ANTHRO.waist;
  const chestRatio = m.chestCm / REFERENCE_ANTHRO.chest;
  const shoulderRatio = m.shoulderCm / REFERENCE_ANTHRO.shoulder;
  const hipRatio = m.hipCm / REFERENCE_ANTHRO.hip;

  const fromWaistHeight = clamp01((m.waistCm / heightCm - 0.33) / 0.15);
  const fromWaistRef = clamp01((waistRatio - 0.86) / 0.26);
  const fromChestRef = clamp01((chestRatio - 0.9) / 0.32);
  const robustCombo = clamp01((waistRatio + chestRatio - 1.75) / 0.55);

  const bodyFat = clamp01(
    fromWaistHeight * 0.35 +
      fromWaistRef * 0.35 +
      fromChestRef * 0.15 +
      robustCombo * 0.15,
  );

  const leanFactor = Math.max(0, 1 - bodyFat * 1.1);
  const rawMuscle = clamp01(
    ((shoulderRatio - 0.96) / 0.18 + (m.armCm / REFERENCE_ANTHRO.arm - 1) * 0.08) *
      leanFactor,
  );
  const muscle = rawMuscle;

  const shoulderWidth = clamp01((shoulderRatio - 0.9) / 0.22);
  const hipWidth = clamp01((hipRatio - 0.9) / 0.22);
  const preset = bodyFatToPreset(bodyFat);

  return {
    bodyFat,
    muscle,
    shoulderWidth,
    hipWidth,
    preset,
  };
}

export function volumeZoneScalesFromParams(
  p: BodyVolumeParams,
): AnatomicalVolumeScales {
  return buildAnatomicalVolumeScales(p);
}

export { buildAnatomicalVolumeScales };
