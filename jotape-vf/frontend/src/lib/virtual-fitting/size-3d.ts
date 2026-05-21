import type { Size } from "@/lib/sizing/recommender";

import { SIZE_OVERLAY_MULTIPLIER } from "./size-fit";

/** Escala del torso de la prenda 3D (M = 1). */
export function garmentScaleForSize(size: Size): number {
  return SIZE_OVERLAY_MULTIPLIER[size];
}

/** Escala global del maniquí según altura de referencia (cm). */
export function mannequinScaleForHeight(heightCm: number): number {
  const clamped = Math.max(150, Math.min(195, heightCm));
  return clamped / 170;
}
