/** Parámetros de volumen corporal (0–1). */
export type BodyVolumeParams = {
  bodyFat: number;
  muscle: number;
  shoulderWidth: number;
  hipWidth: number;
  /** Preset anatómico derivado de bodyFat. */
  preset: BodyVolumePreset;
};

export type BodyVolumePreset = "slim" | "average" | "overweight" | "obese";

/** Escala local X/Z (no afecta altura Y). */
export type VolumeZoneScale = { x: number; z: number };

/** Escalas por región anatómica. */
export type AnatomicalVolumeScales = {
  torso: VolumeZoneScale;
  abdomen: VolumeZoneScale;
  chest: VolumeZoneScale;
  waist: VolumeZoneScale;
  hips: VolumeZoneScale;
  thigh: VolumeZoneScale;
  upperArm: VolumeZoneScale;
  foreArm: VolumeZoneScale;
  hand: VolumeZoneScale;
  shoulder: VolumeZoneScale;
};

export type BodyVolumeApplyResult = {
  params: BodyVolumeParams;
  zones: AnatomicalVolumeScales;
  usingMorphTargets: boolean;
  morphSource: "gltf" | "vf_procedural" | "bones";
};
