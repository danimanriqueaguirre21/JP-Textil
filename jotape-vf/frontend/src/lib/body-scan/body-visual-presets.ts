import type { BodyType } from "@/types/hybrid-body-scan";
import type { ProportionalAvatarScales } from "@/types/proportional-scales";

type ScaleKey = keyof ProportionalAvatarScales;

/** Peso de medidas detectadas en la mezcla final (75% preset + 25% medida). */
export const MEASURED_BLEND_WEIGHT = 0.25;

const SCALE_KEYS: ScaleKey[] = [
  "shoulderScaleX",
  "chestScaleX",
  "waistScaleX",
  "hipScaleX",
  "torsoScaleY",
  "legScaleY",
  "bodyDepthZ",
  "chestDepthZ",
  "abdomenDepthZ",
  "armScaleX",
  "thighScaleX",
];

const UNIT: ProportionalAvatarScales = {
  shoulderScaleX: 1,
  chestScaleX: 1,
  waistScaleX: 1,
  hipScaleX: 1,
  torsoScaleY: 1,
  legScaleY: 1,
  bodyDepthZ: 1,
  chestDepthZ: 1,
  abdomenDepthZ: 1,
  armScaleX: 1,
  thighScaleX: 1,
};

/** Presets visuales seguros por bodyType (1 = avatar CC base). */
export const BODY_VISUAL_PRESETS: Record<
  "SLIM" | "AVERAGE" | "OVERWEIGHT" | "OBESE",
  ProportionalAvatarScales
> = {
  SLIM: {
    shoulderScaleX: 0.94,
    chestScaleX: 0.96,
    waistScaleX: 0.9,
    hipScaleX: 0.94,
    bodyDepthZ: 0.92,
    chestDepthZ: 0.92,
    abdomenDepthZ: 0.9,
    armScaleX: 0.94,
    thighScaleX: 0.94,
    torsoScaleY: 1,
    legScaleY: 1,
  },
  AVERAGE: { ...UNIT },
  OVERWEIGHT: {
    shoulderScaleX: 1.06,
    chestScaleX: 1.1,
    waistScaleX: 1.18,
    hipScaleX: 1.12,
    bodyDepthZ: 1.12,
    chestDepthZ: 1.08,
    abdomenDepthZ: 1.2,
    armScaleX: 1.08,
    thighScaleX: 1.1,
    torsoScaleY: 1,
    legScaleY: 1,
  },
  OBESE: {
    shoulderScaleX: 1.12,
    chestScaleX: 1.18,
    waistScaleX: 1.32,
    hipScaleX: 1.25,
    bodyDepthZ: 1.3,
    chestDepthZ: 1.22,
    abdomenDepthZ: 1.45,
    armScaleX: 1.18,
    thighScaleX: 1.22,
    torsoScaleY: 1,
    legScaleY: 1,
  },
};

/** Tope duro al clamp de medidas antes de mezclar. */
const MEASURED_CLAMP_MAX: Record<ScaleKey, number> = {
  shoulderScaleX: 1.35,
  chestScaleX: 1.45,
  waistScaleX: 1.65,
  hipScaleX: 1.5,
  bodyDepthZ: 1.75,
  chestDepthZ: 1.65,
  abdomenDepthZ: 2,
  armScaleX: 1.25,
  thighScaleX: 1.25,
  torsoScaleY: 1.08,
  legScaleY: 1.05,
};

const MEASURED_CLAMP_MIN = 0.85;

const LIMB_MAX = 1.25;

export type VisualScaleResolution = {
  bodyType: BodyType;
  presetKey: keyof typeof BODY_VISUAL_PRESETS;
  preset: ProportionalAvatarScales;
  rawMeasured: ProportionalAvatarScales;
  measuredClamped: ProportionalAvatarScales;
  final: ProportionalAvatarScales;
  blendWeight: number;
};

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function presetKeyForBodyType(
  bodyType: BodyType,
): keyof typeof BODY_VISUAL_PRESETS {
  if (bodyType === "SLIM") return "SLIM";
  if (bodyType === "OVERWEIGHT") return "OVERWEIGHT";
  if (bodyType === "OBESE") return "OBESE";
  return "AVERAGE";
}

export function getBodyVisualPreset(bodyType: BodyType): ProportionalAvatarScales {
  const key = presetKeyForBodyType(bodyType);
  const base = { ...BODY_VISUAL_PRESETS[key] };
  if (bodyType === "ATHLETIC") {
    return {
      ...base,
      shoulderScaleX: 1.04,
      chestScaleX: 1.05,
      armScaleX: 1.04,
      thighScaleX: 1.03,
    };
  }
  return base;
}

export function clampMeasuredScales(
  raw: ProportionalAvatarScales,
): ProportionalAvatarScales {
  const out = { ...raw };
  for (const key of SCALE_KEYS) {
    const v = raw[key];
    if (!Number.isFinite(v)) continue;
    out[key] = round3(clamp(v, MEASURED_CLAMP_MIN, MEASURED_CLAMP_MAX[key]));
  }
  return out;
}

function applyFinalSafetyCaps(
  scales: ProportionalAvatarScales,
  bodyType: BodyType,
): ProportionalAvatarScales {
  const out = { ...scales };
  out.armScaleX = round3(Math.min(out.armScaleX, LIMB_MAX));
  out.thighScaleX = round3(Math.min(out.thighScaleX, LIMB_MAX));

  if (bodyType === "OBESE" || bodyType === "OVERWEIGHT") {
    out.torsoScaleY = 1;
    out.legScaleY = 1;
  }

  return out;
}

function blendScales(
  preset: ProportionalAvatarScales,
  measured: ProportionalAvatarScales,
  t: number,
): ProportionalAvatarScales {
  const out = { ...preset };
  for (const key of SCALE_KEYS) {
    out[key] = round3(lerp(preset[key], measured[key], t));
  }
  return out;
}

/**
 * Resuelve escalas finales para el rig CC:
 * 75% preset anatómico + 25% medida detectada (clampada).
 */
export function resolveAvatarVisualScales(
  rawMeasured: ProportionalAvatarScales,
  bodyType: BodyType = "AVERAGE",
  blendWeight = MEASURED_BLEND_WEIGHT,
): VisualScaleResolution {
  const presetKey = presetKeyForBodyType(bodyType);
  const preset = getBodyVisualPreset(bodyType);
  const measuredClamped = clampMeasuredScales(rawMeasured);
  const blended = blendScales(preset, measuredClamped, blendWeight);
  const final = applyFinalSafetyCaps(blended, bodyType);

  return {
    bodyType,
    presetKey,
    preset,
    rawMeasured,
    measuredClamped,
    final,
    blendWeight,
  };
}
