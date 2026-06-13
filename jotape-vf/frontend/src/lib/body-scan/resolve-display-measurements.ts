import type { FusedBodyMeasurements } from "@/types/avatar-calibration";
import type { BodyProfile } from "@/types/body-profile";
import type { BodyScanSession } from "@/types/body-scan";
import type { BodyMeasurements } from "@/types/virtual-fitting";

import { fuseBodyScanMeasurements } from "@/lib/body-scan/fuse-measurements";
import {
  normalizeAvatarMeasurements,
  type NormalizedAvatarMeasurements,
  type RawAvatarMeasurements,
} from "@/lib/body-scan/normalize-avatar-measurements";
import { REFERENCE_ANTHRO } from "@/lib/body-scan/avatar-zone-scales";

/** Lectura IA por vista — valores relativos, no circunferencias finales. */
export type PoseViewTechnical = {
  view: "front" | "side";
  shoulderRel: number;
  hipRel: number;
  waistRel: number;
  /** Solo lateral: profundidad estimada del torso en el plano de imagen. */
  depthRel?: number;
};

export type PoseTechnicalReadout = {
  poseQualityPercent: number;
  front?: PoseViewTechnical;
  side?: PoseViewTechnical;
};

export type ResolvedBodyScanMeasurements = {
  fused: FusedBodyMeasurements | null;
  raw: RawAvatarMeasurements | null;
  /** Medidas humanas finales (avatar + UI). */
  human: NormalizedAvatarMeasurements | null;
  technical: PoseTechnicalReadout | null;
};

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

function viewTechnical(
  view: "front" | "side",
  m: BodyMeasurements,
): PoseViewTechnical {
  const shoulderRel = m.shoulderWidthCm / REFERENCE_ANTHRO.shoulder;
  const hipRel = m.hipWidthCm / REFERENCE_ANTHRO.hip;
  const waistRel = m.waistEstimateCm / REFERENCE_ANTHRO.waist;

  if (view === "front") {
    return { view, shoulderRel, hipRel, waistRel };
  }

  const depthRel =
    (m.hipWidthCm * 0.45 + m.shoulderWidthCm * 0.25) / REFERENCE_ANTHRO.depth;

  return {
    view,
    shoulderRel,
    hipRel,
    waistRel,
    depthRel,
  };
}

function buildTechnicalReadout(session: BodyScanSession): PoseTechnicalReadout | null {
  const front = session.front?.pose?.measurements;
  const side = session.side?.pose?.measurements;
  if (!front && !side) return null;

  const poseQuality =
    ((front?.poseQuality ?? 0) + (side?.poseQuality ?? 0)) /
    (front && side ? 2 : 1);

  return {
    poseQualityPercent: Math.round(poseQuality * 100),
    front: front ? viewTechnical("front", front) : undefined,
    side: side ? viewTechnical("side", side) : undefined,
  };
}

export function logMeasurementPipelineDebug(
  resolved: ResolvedBodyScanMeasurements,
): void {
  if (typeof window === "undefined" || !resolved.human) return;

  const displayed = resolved.human;
  console.table({
    rawHeightCm: resolved.raw?.heightCm,
    rawShoulderCm: resolved.raw?.shoulderWidthCm,
    rawHipWidthCm: resolved.raw?.hipWidthCm,
    rawWaistCm: resolved.raw?.waistCm,
    rawChestCm: resolved.raw?.chestCm,
    normalizedHeightCm: displayed.heightCm,
    normalizedChestCm: displayed.chestCm,
    normalizedWaistCm: displayed.waistCm,
    normalizedHipCm: displayed.hipCm,
    normalizedShoulderCm: displayed.shoulderCm,
    normalizedArmCm: displayed.armCm,
    normalizedLegCm: displayed.legCm,
    displayedHeightCm: displayed.heightCm,
    displayedChestCm: displayed.chestCm,
    displayedWaistCm: displayed.waistCm,
    displayedArmCm: displayed.armCm,
    displayedLegCm: displayed.legCm,
  });
}

/**
 * Pipeline único: fusión → raw → medidas humanas normalizadas + lectura técnica IA.
 */
export function resolveBodyScanMeasurements(
  session: BodyScanSession,
  profile: BodyProfile,
): ResolvedBodyScanMeasurements {
  const fused = fuseBodyScanMeasurements(session, profile);
  if (!fused) {
    return { fused: null, raw: null, human: null, technical: null };
  }

  const raw = fusedToRaw(fused, profile);
  const human = normalizeAvatarMeasurements(raw);
  const technical = buildTechnicalReadout(session);

  const resolved: ResolvedBodyScanMeasurements = {
    fused,
    raw,
    human,
    technical,
  };

  logMeasurementPipelineDebug(resolved);
  return resolved;
}
