import type { ProportionalAvatarScales } from "@/types/proportional-scales";

/** Huesos CC_Base afectados por cada escala (male/female comparten rig). */
export const AVATAR_SCALE_BONE_MAP: Record<
  keyof ProportionalAvatarScales,
  { axis: "x" | "y" | "z"; bones: readonly string[] }
> = {
  shoulderScaleX: {
    axis: "x",
    bones: ["CC_Base_L_Clavicle", "CC_Base_R_Clavicle"],
  },
  chestScaleX: {
    axis: "x",
    bones: ["CC_Base_Spine01"],
  },
  chestDepthZ: {
    axis: "z",
    bones: ["CC_Base_Spine01"],
  },
  waistScaleX: {
    axis: "x",
    bones: ["CC_Base_Spine02", "CC_Base_Waist"],
  },
  abdomenDepthZ: {
    axis: "z",
    bones: ["CC_Base_Spine02", "CC_Base_Waist"],
  },
  torsoScaleY: {
    axis: "y",
    bones: ["CC_Base_Spine02", "CC_Base_Waist"],
  },
  hipScaleX: {
    axis: "x",
    bones: ["CC_Base_Hip", "CC_Base_Pelvis"],
  },
  bodyDepthZ: {
    axis: "z",
    bones: ["CC_Base_Hip", "CC_Base_Pelvis"],
  },
  armScaleX: {
    axis: "x",
    bones: ["CC_Base_L_Upperarm", "CC_Base_R_Upperarm"],
  },
  thighScaleX: {
    axis: "x",
    bones: ["CC_Base_L_Thigh", "CC_Base_R_Thigh"],
  },
  legScaleY: {
    axis: "y",
    bones: ["(no aplicado — muslo solo usa thighScaleX en X)"],
  },
};

export const AVATAR_PROTECTED_BONES = [
  "CC_Base_Head",
  "CC_Base_NeckTwist01",
  "CC_Base_NeckTwist02",
  "CC_Base_L_Hand",
  "CC_Base_R_Hand",
  "CC_Base_L_Forearm",
  "CC_Base_R_Forearm",
  "CC_Base_L_Foot",
  "CC_Base_R_Foot",
  "CC_Base_L_Calf",
  "CC_Base_R_Calf",
  "+ todos los huesos *Twist*",
] as const;

export const AVATAR_SKINNED_MESH = "CC_Base_Body";

export function formatScaleBoneMapForDiagnostic(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [scale, { axis, bones }] of Object.entries(AVATAR_SCALE_BONE_MAP)) {
    out[`${scale} (${axis})`] = bones.join(" | ");
  }
  return out;
}
