import type { AvatarGender } from "@/types/virtual-fitting";

export type AvatarProportions = {
  label: string;
  /** Escala global del cuerpo (altura relativa). */
  bodyScale: number;
  headRadius: number;
  neckRadius: number;
  shoulderHalfWidth: number;
  torsoRadius: number;
  torsoLength: number;
  hipHalfWidth: number;
  armRadius: number;
  armLength: number;
  legRadius: number;
  legLength: number;
  footWidth: number;
  skin: string;
  skinShadow: string;
  /** Anclaje Y de la prenda (torso). */
  garmentAnchorY: number;
  garmentWidth: number;
  garmentHeight: number;
};

const MALE: AvatarProportions = {
  label: "Hombre",
  bodyScale: 1.02,
  headRadius: 0.125,
  neckRadius: 0.065,
  shoulderHalfWidth: 0.36,
  torsoRadius: 0.22,
  torsoLength: 0.46,
  hipHalfWidth: 0.11,
  armRadius: 0.065,
  armLength: 0.4,
  legRadius: 0.095,
  legLength: 0.64,
  footWidth: 0.11,
  skin: "#ddb896",
  skinShadow: "#c9a882",
  garmentAnchorY: 1.3,
  garmentWidth: 0.54,
  garmentHeight: 0.58,
};

const FEMALE: AvatarProportions = {
  label: "Mujer",
  bodyScale: 0.98,
  headRadius: 0.118,
  neckRadius: 0.055,
  shoulderHalfWidth: 0.28,
  torsoRadius: 0.2,
  torsoLength: 0.44,
  hipHalfWidth: 0.15,
  armRadius: 0.058,
  armLength: 0.38,
  legRadius: 0.088,
  legLength: 0.62,
  footWidth: 0.1,
  skin: "#e8c4a8",
  skinShadow: "#d4ad92",
  garmentAnchorY: 1.26,
  garmentWidth: 0.5,
  garmentHeight: 0.56,
};

export function getAvatarProportions(gender: AvatarGender): AvatarProportions {
  return gender === "female" ? FEMALE : MALE;
}
