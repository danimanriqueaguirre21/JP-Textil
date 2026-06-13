import type {
  AvatarZoneScales,
  FusedBodyMeasurements,
} from "@/types/avatar-calibration";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";

/** Referencia antropométrica adulto M ~170 cm (MVP). */
export const REFERENCE_ANTHRO = {
  height: 170,
  shoulder: 44,
  chest: 96,
  waist: 78,
  hip: 98,
  depth: 24,
  arm: 58,
  leg: 82,
  torso: 48,
  neck: 38,
} as const;

function clampScale(value: number, min = 0.86, max = 1.16): number {
  return Math.min(max, Math.max(min, value));
}

export function computeAvatarZoneScales(
  fused: FusedBodyMeasurements,
): AvatarZoneScales {
  const ref = REFERENCE_ANTHRO;

  if (isBodyScanDiagnosticMode()) {
    return {
      shoulder: fused.shoulderWidthCm / ref.shoulder,
      chest: fused.chestCm / ref.chest,
      waist: fused.waistCm / ref.waist,
      hip: fused.hipWidthCm / ref.hip,
      depth: fused.depthCm / ref.depth,
      arm: fused.armLengthCm / ref.arm,
      leg: fused.legLengthCm / ref.leg,
      neck: (fused.shoulderWidthCm * 0.85) / ref.neck,
    };
  }

  const shoulder = clampScale(fused.shoulderWidthCm / ref.shoulder);

  return {
    shoulder,
    chest: clampScale(fused.chestCm / ref.chest),
    waist: clampScale(fused.waistCm / ref.waist),
    hip: clampScale(fused.hipWidthCm / ref.hip, 0.88, 1.14),
    depth: clampScale(fused.depthCm / ref.depth, 0.9, 1.12),
    arm: clampScale(fused.armLengthCm / ref.arm, 0.9, 1.12),
    leg: clampScale(fused.legLengthCm / ref.leg, 0.9, 1.12),
    neck: clampScale(
      (fused.shoulderWidthCm * 0.85) / ref.neck,
      0.9,
      1.1,
    ),
  };
}

/** Rellena zoneScales en calibraciones guardadas antes de esta mejora. */
export function withDefaultZoneScales(
  partial: AvatarZoneScales & {
    shoulder?: number;
    depth?: number;
  },
): AvatarZoneScales {
  const shoulder = partial.shoulder ?? 1;
  const depth = partial.depth ?? 1;
  return {
    shoulder,
    chest: partial.chest ?? shoulder * 1.02,
    waist: partial.waist ?? (shoulder + depth) / 2,
    hip: partial.hip ?? shoulder * 1.04,
    depth,
    arm: partial.arm ?? 1,
    leg: partial.leg ?? 1,
    neck: partial.neck ?? shoulder * 0.98,
  };
}
