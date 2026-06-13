import type { Size } from "@/lib/sizing/recommender";

import { BASE_HEIGHT_CM } from "@/lib/body-scan/normalize-avatar-measurements";

import { SIZE_OVERLAY_MULTIPLIER } from "./size-fit";

export { BASE_HEIGHT_CM };

/** Escala del torso de la prenda 3D (M = 1). */
export function garmentScaleForSize(size: Size): number {
  return SIZE_OVERLAY_MULTIPLIER[size];
}

/** Escala vertical del avatar: altura usuario / referencia (170 cm). */
export function mannequinScaleForHeight(heightCm: number): number {
  const clamped = Math.max(120, Math.min(220, heightCm));
  return clamped / BASE_HEIGHT_CM;
}
