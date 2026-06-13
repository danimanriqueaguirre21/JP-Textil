import { REFERENCE_ANTHRO } from "@/lib/body-scan/avatar-zone-scales";
import { resolveAvatarVisualScales } from "@/lib/body-scan/body-visual-presets";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import type { BodyType } from "@/types/hybrid-body-scan";
import type {
  ProportionalAvatarScales,
  ProportionalScaleDebug,
  ProportionalScaleInput,
} from "@/types/proportional-scales";

/** Suavizado base; profundidad lateral usa mezcla más alta. */
const BLEND_WIDTH = 0.58;
const BLEND_DEPTH = 0.78;
const MIN_POSE = 0.38;

const REF_THIGH_WIDTH = 34;

const CLAMP = {
  min: 0.85,
  max: 1.18,
  shoulderMax: 1.15,
  waistMax: 1.22,
  hipMax: 1.18,
  depthMax: 1.15,
  armMax: 1.2,
  thighMax: 1.22,
  torsoYMin: 0.94,
  torsoYMax: 1.06,
  legYMin: 0.9,
  legYMax: 1.1,
} as const;

const BODY_TYPE_BOOST: Record<
  BodyType,
  Partial<ProportionalAvatarScales>
> = {
  SLIM: {
    waistScaleX: 0.94,
    abdomenDepthZ: 0.94,
    armScaleX: 0.96,
    thighScaleX: 0.95,
  },
  AVERAGE: {},
  ATHLETIC: {
    shoulderScaleX: 1.03,
    chestScaleX: 1.02,
    armScaleX: 1.04,
    thighScaleX: 1.03,
  },
  OVERWEIGHT: {
    waistScaleX: 1.08,
    abdomenDepthZ: 1.1,
    bodyDepthZ: 1.06,
    chestDepthZ: 1.05,
    armScaleX: 1.08,
    thighScaleX: 1.09,
    hipScaleX: 1.04,
  },
  OBESE: {
    waistScaleX: 1.14,
    abdomenDepthZ: 1.16,
    bodyDepthZ: 1.1,
    chestDepthZ: 1.08,
    armScaleX: 1.14,
    thighScaleX: 1.14,
    hipScaleX: 1.07,
    chestScaleX: 1.05,
  },
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function softRatio(measured: number, ref: number, blend: number): number {
  const ratio = measured / ref;
  return 1 + (ratio - 1) * blend;
}

function isInRange(value: number, ref: number, spread = 0.55): boolean {
  return value >= ref * (1 - spread) && value <= ref * (1 + spread);
}

function scaleFromMeasure(
  measured: number,
  ref: number,
  min: number,
  max: number,
  reliable: boolean,
  skipped: string[],
  label: string,
  blend = BLEND_WIDTH,
): number {
  if (!Number.isFinite(measured) || measured <= 0) {
    skipped.push(label);
    return 1;
  }

  if (isBodyScanDiagnosticMode()) {
    if (ref <= 0) return 1;
    return measured / ref;
  }

  if (!reliable) {
    skipped.push(label);
    return 1;
  }
  if (!isInRange(measured, ref)) {
    skipped.push(`${label}_outlier`);
    return 1;
  }
  return clamp(softRatio(measured, ref, blend), min, max);
}

function applyBodyTypeBoost(
  scales: ProportionalAvatarScales,
  bodyType: BodyType | undefined,
): void {
  if (!bodyType || bodyType === "AVERAGE") return;
  const boost = BODY_TYPE_BOOST[bodyType];
  const limits: Partial<Record<keyof ProportionalAvatarScales, [number, number]>> = {
    shoulderScaleX: [CLAMP.min, CLAMP.shoulderMax],
    chestScaleX: [CLAMP.min, CLAMP.max],
    waistScaleX: [CLAMP.min, CLAMP.waistMax],
    hipScaleX: [CLAMP.min, CLAMP.hipMax],
    bodyDepthZ: [CLAMP.min, CLAMP.depthMax],
    chestDepthZ: [CLAMP.min, CLAMP.depthMax],
    abdomenDepthZ: [CLAMP.min, CLAMP.depthMax],
    armScaleX: [CLAMP.min, CLAMP.armMax],
    thighScaleX: [CLAMP.min, CLAMP.thighMax],
  };

  for (const key of Object.keys(boost) as (keyof ProportionalAvatarScales)[]) {
    const factor = boost[key];
    const lim = limits[key];
    if (factor !== undefined && typeof scales[key] === "number" && lim) {
      scales[key] = clamp(scales[key] * factor, lim[0], lim[1]);
    }
  }
}

/**
 * Convierte medidas híbridas (pose + segmentación) en escalas proporcionales.
 */
export function computeProportionalScales(
  input: ProportionalScaleInput,
): {
  scales: ProportionalAvatarScales;
  rawScales: ProportionalAvatarScales;
  visual: import("@/lib/body-scan/body-visual-presets").VisualScaleResolution;
  debug: ProportionalScaleDebug;
} {
  const ref = REFERENCE_ANTHRO;
  const skipped: string[] = [];
  const reliable = input.poseQuality >= MIN_POSE;
  const reliableWidth = reliable;
  const reliableDepth = reliable && input.hasSideView;
  const depthBlend = input.segmentationUsed ? BLEND_DEPTH : BLEND_WIDTH;

  if (!reliable) skipped.push("poseQuality");

  const abdomenDepthCm =
    input.abdomenDepthCm && input.abdomenDepthCm > 0
      ? input.abdomenDepthCm
      : input.depthCm;

  const shoulderScaleX = scaleFromMeasure(
    input.shoulderWidthCm,
    ref.shoulder,
    CLAMP.min,
    CLAMP.shoulderMax,
    reliableWidth,
    skipped,
    "shoulder",
  );

  const chestScaleX = scaleFromMeasure(
    input.chestCm,
    ref.chest,
    CLAMP.min,
    CLAMP.max,
    reliableWidth,
    skipped,
    "chest",
  );

  const waistScaleX = scaleFromMeasure(
    input.waistCm,
    ref.waist,
    CLAMP.min,
    CLAMP.waistMax,
    reliableWidth,
    skipped,
    "waist",
  );

  const hipScaleX = scaleFromMeasure(
    input.hipWidthCm,
    ref.hip,
    CLAMP.min,
    CLAMP.hipMax,
    reliableWidth,
    skipped,
    "hip",
  );

  const torsoScaleY = scaleFromMeasure(
    input.torsoLengthCm,
    ref.torso,
    CLAMP.torsoYMin,
    CLAMP.torsoYMax,
    reliable,
    skipped,
    "torso",
    0.48,
  );

  const legScaleY = scaleFromMeasure(
    input.legLengthCm,
    ref.leg,
    CLAMP.legYMin,
    CLAMP.legYMax,
    reliable,
    skipped,
    "leg",
    0.48,
  );

  const bodyDepthZ = scaleFromMeasure(
    input.depthCm,
    ref.depth,
    CLAMP.min,
    CLAMP.depthMax,
    reliableDepth,
    skipped,
    "bodyDepth",
    depthBlend,
  );

  const chestDepthZ = scaleFromMeasure(
    input.depthCm * 0.95,
    ref.depth,
    CLAMP.min,
    CLAMP.depthMax,
    reliableDepth,
    skipped,
    "chestDepth",
    depthBlend,
  );

  const abdomenDepthZ = scaleFromMeasure(
    abdomenDepthCm,
    ref.depth,
    CLAMP.min,
    CLAMP.depthMax,
    reliableDepth,
    skipped,
    "abdomenDepth",
    depthBlend,
  );

  const thighScaleX = scaleFromMeasure(
    input.thighWidthCm ?? input.hipWidthCm * 0.52,
    REF_THIGH_WIDTH,
    CLAMP.min,
    CLAMP.thighMax,
    reliableWidth,
    skipped,
    "thigh",
  );

  const armScaleX = scaleFromMeasure(
    input.waistCm * 0.42 + input.chestCm * 0.08,
    ref.arm * 0.38,
    CLAMP.min,
    CLAMP.armMax,
    reliableWidth,
    skipped,
    "arm",
  );

  const rawScales: ProportionalAvatarScales = isBodyScanDiagnosticMode()
    ? {
        shoulderScaleX,
        chestScaleX,
        waistScaleX,
        hipScaleX,
        torsoScaleY,
        legScaleY,
        bodyDepthZ,
        chestDepthZ,
        abdomenDepthZ,
        armScaleX,
        thighScaleX,
      }
    : {
        shoulderScaleX,
        chestScaleX,
        waistScaleX,
        hipScaleX,
        torsoScaleY,
        legScaleY,
        bodyDepthZ,
        chestDepthZ: Math.max(chestDepthZ, bodyDepthZ * 0.96),
        abdomenDepthZ: Math.max(abdomenDepthZ, bodyDepthZ * 0.98),
        armScaleX,
        thighScaleX,
      };

  if (!isBodyScanDiagnosticMode()) {
    applyBodyTypeBoost(rawScales, input.bodyType);

    if (input.bodyFatEstimate !== undefined && input.bodyFatEstimate > 0.5) {
      const fatBoost = 1 + (input.bodyFatEstimate - 0.5) * 0.22;
      rawScales.waistScaleX = clamp(
        rawScales.waistScaleX * fatBoost,
        CLAMP.min,
        CLAMP.waistMax,
      );
      rawScales.abdomenDepthZ = clamp(
        rawScales.abdomenDepthZ * fatBoost,
        CLAMP.min,
        CLAMP.depthMax,
      );
      rawScales.armScaleX = clamp(
        rawScales.armScaleX * (1 + (fatBoost - 1) * 0.7),
        CLAMP.min,
        CLAMP.armMax,
      );
      rawScales.thighScaleX = clamp(
        rawScales.thighScaleX * (1 + (fatBoost - 1) * 0.65),
        CLAMP.min,
        CLAMP.thighMax,
      );
    }
  }

  const bodyType = input.bodyType ?? "AVERAGE";
  const visual = resolveAvatarVisualScales(rawScales, bodyType);
  const scales = visual.final;

  const debug: ProportionalScaleDebug = {
    alturaUsuario: input.heightCm,
    hombrosUsuario: input.shoulderWidthCm,
    cinturaUsuario: input.waistCm,
    caderaUsuario: input.hipWidthCm,
    profundidadTorso: input.depthCm,
    profundidadAbdomen: abdomenDepthCm,
    bodyType,
    bodyFatEstimate: input.bodyFatEstimate ?? 0,
    shoulderScaleX: scales.shoulderScaleX,
    chestScaleX: scales.chestScaleX,
    waistScaleX: scales.waistScaleX,
    hipScaleX: scales.hipScaleX,
    torsoScaleY: scales.torsoScaleY,
    legScaleY: scales.legScaleY,
    bodyDepthZ: scales.bodyDepthZ,
    chestDepthZ: scales.chestDepthZ,
    abdomenDepthZ: scales.abdomenDepthZ,
    armScaleX: scales.armScaleX,
    thighScaleX: scales.thighScaleX,
    poseQuality: input.poseQuality,
    medidasIgnoradas: skipped,
    rawScales,
    visualPreset: visual.preset,
    measuredClamped: visual.measuredClamped,
    blendWeight: visual.blendWeight,
  };

  return { scales, rawScales, visual, debug };
}

export function logProportionalScalesDebug(debug: ProportionalScaleDebug): void {
  if (typeof window === "undefined") return;
  console.table({
    alturaUsuario: debug.alturaUsuario,
    hombrosUsuario: debug.hombrosUsuario,
    cinturaUsuario: debug.cinturaUsuario,
    caderaUsuario: debug.caderaUsuario,
    profundidadTorso: debug.profundidadTorso,
    profundidadAbdomen: debug.profundidadAbdomen,
    bodyType: debug.bodyType,
    bodyFatEstimate: debug.bodyFatEstimate,
    shoulderScaleX: debug.shoulderScaleX,
    chestScaleX: debug.chestScaleX,
    waistScaleX: debug.waistScaleX,
    hipScaleX: debug.hipScaleX,
    bodyDepthZ: debug.bodyDepthZ,
    chestDepthZ: debug.chestDepthZ,
    abdomenDepthZ: debug.abdomenDepthZ,
    armScaleX: debug.armScaleX,
    thighScaleX: debug.thighScaleX,
    poseQuality: debug.poseQuality,
  });
  if (debug.medidasIgnoradas.length) {
    console.info("[proportional-scales] medidas ignoradas:", debug.medidasIgnoradas);
  }
}

export function proportionalInputFromCalibration(
  cal: import("@/types/avatar-calibration").AvatarCalibration,
): ProportionalScaleInput {
  return {
    heightCm: cal.heightCm,
    shoulderWidthCm: cal.shoulderWidthCm,
    chestCm: cal.chestCm,
    waistCm: cal.waistCm,
    hipWidthCm: cal.hipWidthCm,
    depthCm: cal.depthCm,
    abdomenDepthCm: cal.abdomenDepthCm,
    thighWidthCm: cal.thighWidthCm,
    torsoLengthCm: cal.torsoLengthCm,
    legLengthCm: cal.legLengthCm,
    poseQuality: cal.poseQuality,
    hasSideView: cal.hasSideView ?? false,
    bodyType: cal.bodyType,
    bodyFatEstimate: cal.bodyFatEstimate,
    segmentationUsed: cal.hybridDiagnostics?.segmentationUsed,
  };
}
