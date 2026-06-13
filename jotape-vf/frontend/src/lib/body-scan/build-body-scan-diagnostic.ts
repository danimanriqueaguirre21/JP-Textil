import {
  buildHybridBodyEstimate,
  computeBMI,
} from "@/lib/body-scan/classify-body-type";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import { computeProportionalScales } from "@/lib/body-scan/compute-proportional-scales";
import {
  fuseBodyScanMeasurements,
  type CircumferenceDiagnostic,
} from "@/lib/body-scan/fuse-measurements";
import { computeCorrectedCircumference } from "@/lib/body-scan/body-circumference";
import { normalizeAvatarMeasurements } from "@/lib/body-scan/normalize-avatar-measurements";
import type { BodyProfile } from "@/types/body-profile";
import type { BodyScanSession } from "@/types/body-scan";
import type { BodyScanDiagnosticReport } from "@/types/body-scan-diagnostic";
import { REFERENCE_ANTHRO } from "@/lib/body-scan/avatar-zone-scales";
import { formatScaleBoneMapForDiagnostic } from "@/lib/body-scan/avatar-scale-bone-map";

function pickSeg(session: BodyScanSession, view: "front" | "side") {
  return session[view]?.pose?.segmentation;
}

function pickPose(session: BodyScanSession, view: "front" | "side") {
  return session[view]?.pose?.measurements;
}

function buildCircumferenceFromSession(
  session: BodyScanSession,
  profile: BodyProfile,
): CircumferenceDiagnostic {
  const frontSeg = pickSeg(session, "front");
  const sideSeg = pickSeg(session, "side");
  const frontPose = pickPose(session, "front");
  const shoulder =
    frontSeg?.shoulderWidthCm ?? frontPose?.shoulderWidthCm ?? 0;

  const ctx = {
    heightCm: profile.heightCm,
    weightKg: profile.weightKg > 0 ? profile.weightKg : undefined,
    shoulderWidthCm: shoulder,
    hipFrontWidthCm: frontSeg?.hipWidthCm ?? 0,
    chestFrontWidthCm: frontSeg?.chestWidthCm ?? 0,
  };

  const out: CircumferenceDiagnostic = {};
  if (frontSeg?.waistWidthCm) {
    out.waist = computeCorrectedCircumference({
      zone: "waist",
      frontWidthCm: frontSeg.waistWidthCm,
      sideDepthCm: sideSeg?.abdomenDepthCm ?? sideSeg?.hipDepthCm,
      ...ctx,
    });
  }
  if (frontSeg?.chestWidthCm) {
    out.chest = computeCorrectedCircumference({
      zone: "chest",
      frontWidthCm: frontSeg.chestWidthCm,
      sideDepthCm: sideSeg?.chestDepthCm,
      ...ctx,
    });
  }
  if (frontSeg?.hipWidthCm) {
    out.hip = computeCorrectedCircumference({
      zone: "hip",
      frontWidthCm: frontSeg.hipWidthCm,
      sideDepthCm: sideSeg?.hipDepthCm ?? sideSeg?.gluteDepthCm,
      ...ctx,
    });
  }
  return out;
}

export function extractRawDetectedMeasures(
  session: BodyScanSession,
  profile: BodyProfile,
) {
  const frontSeg = pickSeg(session, "front");
  const sideSeg = pickSeg(session, "side");
  const frontPose = pickPose(session, "front");
  const circ = buildCircumferenceFromSession(session, profile);

  const cal =
    session.front?.pose?.calibration ?? session.side?.pose?.calibration;

  return {
    ancho_hombros_cm:
      frontSeg?.shoulderWidthCm ?? frontPose?.shoulderWidthCm ?? 0,
    pecho_estimado_cm:
      circ.chest?.circumferenceCorrectedCm ??
      (frontPose
        ? Math.round((frontPose.shoulderWidthCm ?? 0) * 2.12 + 10)
        : 0),
    cintura_estimada_cm:
      circ.waist?.circumferenceCorrectedCm ??
      frontPose?.waistEstimateCm ??
      0,
    cadera_estimada_cm:
      circ.hip?.circumferenceCorrectedCm ?? frontPose?.hipWidthCm ?? 0,
    profundidad_pecho_cm: sideSeg?.chestDepthCm ?? 0,
    profundidad_abdomen_cm: sideSeg?.abdomenDepthCm ?? 0,
    profundidad_cadera_cm: sideSeg?.hipDepthCm ?? sideSeg?.gluteDepthCm ?? 0,
    pixelHeight: cal?.pixelHeight,
    cmPerPixel: cal?.cmPerPixel,
    altura_cm: profile.heightCm,
    peso_kg: profile.weightKg,
    circumference: circ,
  };
}

export function buildBodyScanDiagnosticReport(
  session: BodyScanSession,
  profile: BodyProfile,
): BodyScanDiagnosticReport | null {
  const fused = fuseBodyScanMeasurements(session, profile);
  if (!fused) return null;

  const detected = extractRawDetectedMeasures(session, profile);
  const hasSide = session.side?.pose?.status === "ready";
  const bmi =
    profile.weightKg > 0 && profile.heightCm > 0
      ? computeBMI(profile.weightKg, profile.heightCm)
      : undefined;

  const raw = {
    heightCm: profile.heightCm > 0 ? profile.heightCm : fused.heightCm,
    chestCm: fused.chestCm,
    waistCm: fused.waistCm,
    hipWidthCm: fused.hipWidthCm,
    shoulderWidthCm: fused.shoulderWidthCm,
    depthCm: fused.depthCm,
    armLengthCm: fused.armLengthCm,
    legLengthCm: fused.legLengthCm,
  };

  const normalized = normalizeAvatarMeasurements(raw);
  const classification = buildHybridBodyEstimate({
    heightCm: normalized.heightCm,
    chestCm: normalized.chestCm,
    waistCm: normalized.waistCm,
    hipCm: normalized.hipCm,
    depthCm: normalized.depthCm,
    abdomenDepthCm: fused.abdomenDepthCm ?? normalized.depthCm,
    shoulderWidthCm: normalized.shoulderCm,
    thighWidthCm: fused.thighWidthCm ?? 0,
    weightKg: profile.weightKg > 0 ? profile.weightKg : undefined,
  });

  const { scales, rawScales, visual } = computeProportionalScales({
    heightCm: normalized.heightCm,
    shoulderWidthCm: normalized.shoulderCm,
    chestCm: normalized.chestCm,
    waistCm: normalized.waistCm,
    hipWidthCm: normalized.hipCm,
    depthCm: normalized.depthCm,
    abdomenDepthCm: fused.abdomenDepthCm,
    thighWidthCm: fused.thighWidthCm,
    torsoLengthCm: fused.torsoLengthCm,
    legLengthCm: normalized.legCm,
    poseQuality: fused.poseQuality,
    hasSideView: hasSide,
    bodyType: classification.bodyType,
    bodyFatEstimate: classification.bodyFatEstimate,
    segmentationUsed: fused.segmentationUsed,
  });

  return {
    user: {
      altura_cm: profile.heightCm,
      peso_kg: profile.weightKg,
      pixelHeight: detected.pixelHeight,
      cmPerPixel: detected.cmPerPixel,
    },
    detected: {
      ancho_hombros_cm: detected.ancho_hombros_cm,
      pecho_estimado_cm: detected.pecho_estimado_cm,
      cintura_estimada_cm: detected.cintura_estimada_cm,
      cadera_estimada_cm: detected.cadera_estimada_cm,
      profundidad_pecho_cm: detected.profundidad_pecho_cm,
      profundidad_abdomen_cm: detected.profundidad_abdomen_cm,
      profundidad_cadera_cm: detected.profundidad_cadera_cm,
    },
    circumference: fused.circumferenceDiagnostic ?? detected.circumference,
    classification: {
      bodyType: classification.bodyType,
      bodyFatEstimate: classification.bodyFatEstimate,
      BMI: bmi,
    },
    scales,
    rawScales,
    visualPreset: visual.preset,
    measuredClamped: visual.measuredClamped,
    presetKey: visual.presetKey,
    visualBlendWeight: visual.blendWeight,
    scaleBoneMap: formatScaleBoneMapForDiagnostic(),
    final: {
      heightCm: normalized.heightCm,
      weightKg: profile.weightKg,
      shoulderWidthCm: normalized.shoulderCm,
      chestCm: normalized.chestCm,
      waistCm: normalized.waistCm,
      hipWidthCm: normalized.hipCm,
      depthCm: normalized.depthCm,
      abdomenDepthCm: fused.abdomenDepthCm ?? normalized.depthCm,
      thighWidthCm: fused.thighWidthCm ?? 0,
      armLengthCm: normalized.armCm,
      legLengthCm: normalized.legCm,
      torsoLengthCm: fused.torsoLengthCm,
      proportionalScales: scales,
      bodyType: classification.bodyType,
      bodyFatEstimate: classification.bodyFatEstimate,
      heightScale: normalized.heightCm / REFERENCE_ANTHRO.height,
      hasSideView: hasSide,
      segmentationUsed: fused.segmentationUsed ?? false,
    },
    diagnosticMode: true,
  };
}

export function shouldLogBodyScanDiagnostic(): boolean {
  return isBodyScanDiagnosticMode();
}
