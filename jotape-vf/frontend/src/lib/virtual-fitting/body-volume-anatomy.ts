import type {
  AnatomicalVolumeScales,
  BodyVolumeParams,
  BodyVolumePreset,
  VolumeZoneScale,
} from "@/types/body-volume";

/** Reparto grasa (suma = 1). Sin mezclar con muscle. */
export const FAT_ZONE_WEIGHT = {
  abdomen: 0.5,
  chest: 0.2,
  hips: 0.15,
  thigh: 0.1,
  upperArm: 0.05,
  foreArm: 0,
  hand: 0,
} as const;

/** Z >> X: volumen frontal (profundidad), no lateral exagerado. */
const FAT_ZONE_MAX = {
  abdomen: { x: 0.07, z: 0.22 },
  chest: { x: 0.06, z: 0.17 },
  waist: { x: 0.07, z: 0.19 },
  hips: { x: 0.07, z: 0.16 },
  thigh: { x: 0.06, z: 0.12 },
  upperArm: { x: 0.04, z: 0.05 },
  foreArm: { x: 0.02, z: 0.025 },
  hand: { x: 0.01, z: 0.015 },
} as const;

/** Músculo solo en estas zonas (independiente de bodyFat). */
const MUSCLE_ZONE_MAX = {
  shoulder: { x: 0.04, z: 0.03 },
  chest: { x: 0.05, z: 0.04 },
  upperArm: { x: 0.07, z: 0.08 },
  thigh: { x: 0.05, z: 0.06 },
} as const;

const PRESET_GAIN: Record<BodyVolumePreset, number> = {
  slim: -0.2,
  average: 0.25,
  overweight: 0.78,
  obese: 1,
};

/** Más profundidad (Z) que ancho (X) en torso. */
const DEPTH_BIAS = 1.42;
const LATERAL_DAMP = 0.72;

export function bodyFatToPreset(bodyFat: number): BodyVolumePreset {
  if (bodyFat < 0.26) return "slim";
  if (bodyFat < 0.48) return "average";
  if (bodyFat < 0.68) return "overweight";
  return "obese";
}

export function clampBoneX(v: number): number {
  return Math.min(1.18, Math.max(0.88, v));
}

export function clampBoneZ(v: number): number {
  return Math.min(1.22, Math.max(0.88, v));
}

export function clampHandScale(v: number): number {
  return Math.min(1.02, Math.max(0.98, v));
}

/** A mayor grasa, menos definición muscular visible. */
export function effectiveMuscleLevel(muscle: number, bodyFat: number): number {
  const suppression = Math.max(0, 1 - bodyFat);
  return muscle * suppression * suppression;
}

function fatAmplitude(bodyFat: number, preset: BodyVolumePreset): number {
  const centered = Math.max(0, (bodyFat - 0.32) / 0.58);
  const gain = PRESET_GAIN[preset];
  if (gain < 0) return Math.max(-0.2, gain * centered);
  return Math.min(1, centered * gain);
}

function fatZoneDelta(
  weight: number,
  max: { x: number; z: number },
  amp: number,
): VolumeZoneScale {
  const w = weight / FAT_ZONE_WEIGHT.abdomen;
  return {
    x: max.x * w * amp * LATERAL_DAMP,
    z: max.z * w * amp * DEPTH_BIAS,
  };
}

function muscleZoneDelta(
  max: { x: number; z: number },
  effectiveMuscle: number,
): VolumeZoneScale {
  return {
    x: max.x * effectiveMuscle,
    z: max.z * effectiveMuscle * DEPTH_BIAS * 0.85,
  };
}

function applyFat(base: VolumeZoneScale): VolumeZoneScale {
  return {
    x: clampBoneX(1 + base.x),
    z: clampBoneZ(1 + base.z),
  };
}

function applyFatAndMuscle(
  fat: VolumeZoneScale,
  muscle: VolumeZoneScale = { x: 0, z: 0 },
): VolumeZoneScale {
  return {
    x: clampBoneX(1 + fat.x + muscle.x),
    z: clampBoneZ(1 + fat.z + muscle.z),
  };
}

/**
 * Escalas anatómicas: grasa (torso redondo) y músculo (solo si hay poca grasa).
 */
export function buildAnatomicalVolumeScales(
  p: BodyVolumeParams,
): AnatomicalVolumeScales {
  const preset = p.preset ?? bodyFatToPreset(p.bodyFat);
  const amp = fatAmplitude(p.bodyFat, preset);
  const effMuscle = effectiveMuscleLevel(p.muscle, p.bodyFat);

  const abdomenD = fatZoneDelta(FAT_ZONE_WEIGHT.abdomen, FAT_ZONE_MAX.abdomen, amp);
  const chestFatD = fatZoneDelta(FAT_ZONE_WEIGHT.chest, FAT_ZONE_MAX.chest, amp);
  const waistD = fatZoneDelta(FAT_ZONE_WEIGHT.abdomen * 0.4, FAT_ZONE_MAX.waist, amp);
  const hipsFatD = fatZoneDelta(FAT_ZONE_WEIGHT.hips, FAT_ZONE_MAX.hips, amp);
  const thighFatD = fatZoneDelta(FAT_ZONE_WEIGHT.thigh, FAT_ZONE_MAX.thigh, amp);
  const armFatD = fatZoneDelta(FAT_ZONE_WEIGHT.upperArm, FAT_ZONE_MAX.upperArm, amp);

  const abdomen = applyFat(abdomenD);
  const waist = applyFat(waistD);

  const chest = applyFatAndMuscle(
    chestFatD,
    muscleZoneDelta(MUSCLE_ZONE_MAX.chest, effMuscle),
  );

  const hips = applyFat({
    x: hipsFatD.x + p.hipWidth * 0.02 * amp,
    z: hipsFatD.z + p.hipWidth * 0.025 * amp,
  });

  const thigh = applyFatAndMuscle(
    thighFatD,
    muscleZoneDelta(MUSCLE_ZONE_MAX.thigh, effMuscle),
  );

  const upperArm = applyFatAndMuscle(
    armFatD,
    muscleZoneDelta(MUSCLE_ZONE_MAX.upperArm, effMuscle),
  );

  const foreArm = {
    x: clampBoneX(1 + Math.min(0.03, armFatD.x * 0.35)),
    z: clampBoneZ(1 + Math.min(0.035, armFatD.z * 0.35)),
  };

  const hand = {
    x: clampHandScale(1),
    z: clampHandScale(1),
  };

  const shoulderMuscle = muscleZoneDelta(MUSCLE_ZONE_MAX.shoulder, effMuscle);
  const shoulder = {
    x: clampBoneX(
      1 +
        shoulderMuscle.x +
        Math.min(0.025, (p.shoulderWidth - 0.5) * 0.04 * amp),
    ),
    z: clampBoneZ(1 + shoulderMuscle.z * 0.85),
  };

  const torso = {
    x: clampBoneX((abdomen.x + chest.x + waist.x) / 3),
    z: clampBoneZ((abdomen.z + chest.z + waist.z) / 3),
  };

  return {
    torso,
    abdomen,
    chest,
    waist,
    hips,
    thigh,
    upperArm,
    foreArm,
    hand,
    shoulder,
  };
}

export function formatZoneScale(z: VolumeZoneScale): string {
  return `x${z.x.toFixed(3)} z${z.z.toFixed(3)}`;
}
