import type { AvatarGender } from "@/types/virtual-fitting";

/**
 * GLB del avatar. Por defecto basemeshes locales.
 * Ready Player Me: define en .env.local
 *   NEXT_PUBLIC_AVATAR_MALE_GLB_URL=https://models.readyplayer.me/....glb
 *   NEXT_PUBLIC_AVATAR_FEMALE_GLB_URL=https://models.readyplayer.me/....glb
 */
export const AVATAR_MODEL_URL: Record<AvatarGender, string> = {
  male:
    process.env.NEXT_PUBLIC_AVATAR_MALE_GLB_URL ??
    "/models/avatars/male.glb",
  female:
    process.env.NEXT_PUBLIC_AVATAR_FEMALE_GLB_URL ??
    "/models/avatars/female.glb",
};
export type AvatarModelConfig = {
  /** Rotación inicial (radianes) para alinear el modelo de pie. */
  rotationY: number;
  /** Altura objetivo en metros tras normalizar. */
  targetHeight: number;
  /** Desplazamiento fino tras centrar (pies en Y=0). */
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
