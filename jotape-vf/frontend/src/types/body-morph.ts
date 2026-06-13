/** Zonas corporales deformables vía morphTargetInfluences. */
export type BodyMorphZone =
  | "belly"
  | "chest"
  | "waist"
  | "hip"
  | "arm"
  | "leg"
  | "neck";

export type BodyMorphInfluences = Record<BodyMorphZone, number>;

/** Nombres estándar en GLB (export Blender) o generados en runtime (`vf_*`). */
export const BODY_MORPH_TARGET_NAMES: Record<BodyMorphZone, string> = {
  belly: "vf_belly",
  chest: "vf_chest",
  waist: "vf_waist",
  hip: "vf_hip",
  arm: "vf_arm",
  leg: "vf_leg",
  neck: "vf_neck",
};

export const BODY_MORPH_ZONES = Object.keys(
  BODY_MORPH_TARGET_NAMES,
) as BodyMorphZone[];
