import type { BodyScanSession } from "@/types/body-scan";
import type { BodyProfile } from "@/types/body-profile";
import type { FusedBodyMeasurements } from "@/types/avatar-calibration";
import type { BodyMeasurements } from "@/types/virtual-fitting";
import type { SegmentationBandMeasures } from "@/types/hybrid-body-scan";
import { estimateLimbMeasurements } from "@/lib/virtual-fitting/estimate-limb-measurements";
import { REFERENCE_ANTHRO } from "@/lib/body-scan/avatar-zone-scales";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import {
  computeCorrectedCircumference,
  logZoneCircumferenceDebug,
  type ZoneCircumferenceResult,
} from "@/lib/body-scan/body-circumference";
import {
  buildHybridBodyEstimate,
  computeBMI,
  logBodyClassification,
} from "@/lib/body-scan/classify-body-type";

export type MeasurementFormulaLog = {
  waistCm: string;
  chestCm: string;
  hipWidthCm: string;
  shoulderWidthCm: string;
  segmentationUsed: boolean;
  frontSegPresent: boolean;
  sideSegPresent: boolean;
};

export type CircumferenceDiagnostic = {
  waist?: ZoneCircumferenceResult;
  chest?: ZoneCircumferenceResult;
  hip?: ZoneCircumferenceResult;
};

function pickMeasurements(
  session: BodyScanSession,
  view: "front" | "side",
): BodyMeasurements | null {
  const cap = session[view];
  if (cap?.pose?.status !== "ready" || !cap.pose.measurements) return null;
  return cap.pose.measurements;
}

function segHasValidFront(seg: SegmentationBandMeasures): boolean {
  return (
    seg.waistWidthCm > 15 ||
    seg.chestWidthCm > 15 ||
    seg.hipWidthCm > 15 ||
    seg.shoulderWidthCm > 15
  );
}

function segHasValidSide(seg: SegmentationBandMeasures): boolean {
  return (
    (seg.abdomenDepthCm ?? 0) > 8 ||
    (seg.chestDepthCm ?? 0) > 8 ||
    (seg.hipDepthCm ?? 0) > 8
  );
}

function pickSegmentation(
  session: BodyScanSession,
  view: "front" | "side",
): SegmentationBandMeasures | null {
  const cap = session[view];
  const seg = cap?.pose?.segmentation;
  if (!seg) return null;
  if (view === "front" && segHasValidFront(seg)) return seg;
  if (view === "side" && segHasValidSide(seg)) return seg;
  return null;
}

function avg(a: number, b: number): number {
  return Math.round((a + b) / 2);
}

function blendMeasure(
  segmentation: number,
  pose: number,
  segWeight = 0.72,
): number {
  const weight = isBodyScanDiagnosticMode() ? 1 : segWeight;
  if (!Number.isFinite(segmentation) || segmentation <= 0) return pose;
  if (!Number.isFinite(pose) || pose <= 0) return segmentation;
  return Math.round(segmentation * weight + pose * (1 - weight));
}

export function logMeasurementFormulas(log: MeasurementFormulaLog): void {
  if (typeof window === "undefined") return;
  console.info("=== FÓRMULAS DE MEDIDAS (corregidas) ===");
  console.table(log);
}

export function fuseBodyScanMeasurements(
  session: BodyScanSession,
  profile: BodyProfile,
): FusedBodyMeasurements | null {
  const front = pickMeasurements(session, "front");
  const side = pickMeasurements(session, "side");
  const frontSeg = pickSegmentation(session, "front");
  const sideSeg = pickSegmentation(session, "side");

  if (!front && !side) return null;

  const primary = front ?? side!;
  const heightCm =
    profile.heightCm > 0
      ? profile.heightCm
      : avg(
          primary.heightEstimateCm,
          (side ?? primary).heightEstimateCm || primary.heightEstimateCm,
        );

  const weightKg = profile.weightKg > 0 ? profile.weightKg : undefined;
  const measureCtx = {
    heightCm,
    weightKg,
    shoulderWidthCm: 0,
    hipFrontWidthCm: frontSeg?.hipWidthCm ?? 0,
    chestFrontWidthCm: frontSeg?.chestWidthCm ?? 0,
  };

  const poseShoulder = front?.shoulderWidthCm ?? primary.shoulderWidthCm;
  const poseHip = front?.hipWidthCm ?? primary.hipWidthCm;
  const poseWaist =
    front && side
      ? avg(front.waistEstimateCm, side.waistEstimateCm)
      : primary.waistEstimateCm;

  const shoulderWidthCm = frontSeg
    ? blendMeasure(frontSeg.shoulderWidthCm, poseShoulder, 0.78)
    : poseShoulder;

  measureCtx.shoulderWidthCm = shoulderWidthCm;

  const circumferenceDiag: CircumferenceDiagnostic = {};

  let waistCm = poseWaist;
  if (frontSeg && frontSeg.waistWidthCm > 0) {
    const waist = computeCorrectedCircumference({
      zone: "waist",
      frontWidthCm: frontSeg.waistWidthCm,
      sideDepthCm: sideSeg?.abdomenDepthCm ?? sideSeg?.hipDepthCm,
      ...measureCtx,
    });
    circumferenceDiag.waist = waist;
    logZoneCircumferenceDebug("cintura", waist);
    waistCm = blendMeasure(waist.circumferenceCorrectedCm, poseWaist, 0.88);
  }

  const chestFromPose = Math.round(shoulderWidthCm * 2.12 + 10);
  let chestCm = chestFromPose;
  if (frontSeg && frontSeg.chestWidthCm > 0) {
    const chest = computeCorrectedCircumference({
      zone: "chest",
      frontWidthCm: frontSeg.chestWidthCm,
      sideDepthCm: sideSeg?.chestDepthCm,
      ...measureCtx,
    });
    circumferenceDiag.chest = chest;
    logZoneCircumferenceDebug("pecho", chest);
    chestCm = blendMeasure(chest.circumferenceCorrectedCm, chestFromPose, 0.85);
  }

  let hipCm = poseHip;
  if (frontSeg && frontSeg.hipWidthCm > 0) {
    const hip = computeCorrectedCircumference({
      zone: "hip",
      frontWidthCm: frontSeg.hipWidthCm,
      sideDepthCm: sideSeg?.hipDepthCm ?? sideSeg?.gluteDepthCm,
      ...measureCtx,
    });
    circumferenceDiag.hip = hip;
    logZoneCircumferenceDebug("cadera", hip);
    hipCm = blendMeasure(hip.circumferenceCorrectedCm, poseHip, 0.85);
  }

  const abdomenDepthCm = sideSeg?.abdomenDepthCm
    ? Math.round(
        Math.min(
          sideSeg.abdomenDepthCm,
          (circumferenceDiag.waist?.frontWidthCm ?? waistCm * 0.35) * 0.62,
        ) * 10,
      ) / 10
    : Math.round(waistCm * 0.28);

  const depthCm = sideSeg
    ? Math.round(
        Math.max(
          REFERENCE_ANTHRO.depth * 0.85,
          avg(
            sideSeg.chestDepthCm ?? abdomenDepthCm,
            sideSeg.hipDepthCm ?? abdomenDepthCm,
          ) * 0.85,
        ) * 10,
      ) / 10
    : Math.round(hipCm * 0.28);

  const thighWidthCm = frontSeg?.thighWidthCm ?? Math.round(hipCm * 0.52);

  const poseQuality = Math.min(
    1,
    ((front?.poseQuality ?? 0) + (side?.poseQuality ?? 0)) /
      (front && side ? 2 : 1),
  );

  const limbs = estimateLimbsFromSession(session, heightCm);

  const classificationInput = {
    heightCm,
    chestCm,
    waistCm,
    hipCm,
    depthCm,
    abdomenDepthCm,
    shoulderWidthCm,
    thighWidthCm,
    weightKg,
  };

  const hybrid = buildHybridBodyEstimate(classificationInput);
  logBodyClassification(hybrid, classificationInput);

  const w = circumferenceDiag.waist;
  const c = circumferenceDiag.chest;
  const h = circumferenceDiag.hip;

  logMeasurementFormulas({
    shoulderWidthCm: frontSeg
      ? `ancho frontal hombros=${frontSeg.shoulderWidthCm}cm → ${shoulderWidthCm}cm`
      : `pose hombros=${poseShoulder}cm`,
    chestCm: c
      ? `raw=${c.circumferenceRawCm} × ${c.correctionFactor} → ${c.circumferenceCorrectedCm} → ${chestCm}cm`
      : `pose: ${chestFromPose}cm`,
    waistCm: w
      ? `ancho=${w.frontWidthCm} prof=${w.sideDepthCm} raw=${w.circumferenceRawCm} corr=${w.circumferenceCorrectedCm} → ${waistCm}cm`
      : `pose=${poseWaist}cm`,
    hipWidthCm: h
      ? `ancho=${h.frontWidthCm} prof=${h.sideDepthCm} raw=${h.circumferenceRawCm} corr=${h.circumferenceCorrectedCm} → ${hipCm}cm`
      : `pose=${poseHip}cm`,
    segmentationUsed: Boolean(frontSeg || sideSeg),
    frontSegPresent: Boolean(frontSeg),
    sideSegPresent: Boolean(sideSeg),
  });

  if (weightKg) {
    console.info(
      `BMI = ${computeBMI(weightKg, heightCm)} (${weightKg}kg / ${heightCm}cm)`,
    );
  }

  return {
    heightCm,
    shoulderWidthCm,
    hipWidthCm: hipCm,
    waistCm: hybrid.waistCm,
    chestCm: hybrid.chestCm,
    depthCm: hybrid.depthCm,
    armLengthCm: limbs.armLengthCm,
    legLengthCm: limbs.legLengthCm,
    torsoLengthCm: limbs.torsoLengthCm,
    poseQuality,
    abdomenDepthCm: hybrid.abdomenDepthCm,
    thighWidthCm: hybrid.thighWidthCm,
    bodyFatEstimate: hybrid.bodyFatEstimate,
    bodyType: hybrid.bodyType,
    segmentationUsed: Boolean(frontSeg || sideSeg),
    circumferenceDiagnostic: circumferenceDiag,
  };
}

function estimateLimbsFromSession(
  session: BodyScanSession,
  heightCm: number,
): { armLengthCm: number; legLengthCm: number; torsoLengthCm: number } {
  const fromLandmarks: ReturnType<typeof estimateLimbMeasurements>[] = [];

  for (const view of ["front", "side"] as const) {
    const cap = session[view];
    const lm = cap?.pose?.landmarks;
    if (lm?.length) {
      const est = estimateLimbMeasurements(lm, heightCm);
      if (est) fromLandmarks.push(est);
    }
  }

  if (fromLandmarks.length > 0) {
    const n = fromLandmarks.length;
    return {
      armLengthCm: Math.round(
        fromLandmarks.reduce((s, x) => s + x.armLengthCm, 0) / n,
      ),
      legLengthCm: Math.round(
        fromLandmarks.reduce((s, x) => s + x.legLengthCm, 0) / n,
      ),
      torsoLengthCm: Math.round(
        fromLandmarks.reduce((s, x) => s + x.torsoLengthCm, 0) / n,
      ),
    };
  }

  const ratio = heightCm / REFERENCE_ANTHRO.height;
  return {
    armLengthCm: Math.round(REFERENCE_ANTHRO.arm * ratio),
    legLengthCm: Math.round(REFERENCE_ANTHRO.leg * ratio),
    torsoLengthCm: Math.round(REFERENCE_ANTHRO.torso * ratio),
  };
}

export function proportionsScaleFromFused(fused: FusedBodyMeasurements): {
  widthScale: number;
  depthScale: number;
} {
  const widthScale = clamp(fused.shoulderWidthCm / REFERENCE_ANTHRO.shoulder, 0.88, 1.14);
  const depthScale = clamp(fused.depthCm / REFERENCE_ANTHRO.depth, 0.9, 1.12);
  return { widthScale, depthScale };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
