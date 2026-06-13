import type { AvatarGender } from "@/types/virtual-fitting";

/** Avatar Character Creator con rig (CC_Base_*). ~33–36 MB */
const AVATAR_GLB_URL: Record<AvatarGender, string> = {
  male: "/models/avatars/male.glb",
  female: "/models/avatars/female.glb",
};

function resolveAvatarUrl(gender: AvatarGender): string {
  const envKey =
    gender === "male"
      ? process.env.NEXT_PUBLIC_AVATAR_MALE_GLB_URL
      : process.env.NEXT_PUBLIC_AVATAR_FEMALE_GLB_URL;
  if (envKey) return envKey;
  return AVATAR_GLB_URL[gender];
}

/**
 * GLB del avatar (Character Creator, skinned mesh + huesos).
 * Override: NEXT_PUBLIC_AVATAR_MALE_GLB_URL / NEXT_PUBLIC_AVATAR_FEMALE_GLB_URL
 */
export const AVATAR_MODEL_URL: Record<AvatarGender, string> = {
  male: resolveAvatarUrl("male"),
  female: resolveAvatarUrl("female"),
};

export type AvatarModelConfig = {
  rotationY: number;
  targetHeight: number;
  positionOffset: [number, number, number];
};

export const AVATAR_MODEL_CONFIG: Record<AvatarGender, AvatarModelConfig> = {
  male: {
    rotationY: 0,
    targetHeight: 1.78,
    positionOffset: [0, 0, 0],
  },
  female: {
    rotationY: 0,
    targetHeight: 1.72,
    positionOffset: [0, 0, 0],
  },
};

export function getAvatarModelConfig(gender: AvatarGender): AvatarModelConfig {
  return AVATAR_MODEL_CONFIG[gender];
}

export function isCharacterCreatorAvatarUrl(url: string): boolean {
  return /\/models\/avatars\/(male|female)\.glb$/i.test(url);
}
