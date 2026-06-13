import { PerspectiveCamera } from "three";

import { getAvatarModelConfig } from "@/lib/virtual-fitting/avatar-models";
import type { AvatarGender } from "@/types/virtual-fitting";

/** Encuadre probador: cuerpo completo con margen cabeza/pies (hombre y mujer). */
export const FITTING_VIEW = {
  fov: 28,
  /** Más bajo = cámara más lejos. */
  verticalFill: 0.88,
  /** Cabeza CC suele sobresalir del bbox normalizado. */
  headMarginRatio: 0.06,
  /** Sube un poco el punto de mira para no cortar la frente. */
  lookAtYOffsetRatio: 0.02,
  /** Ancho de hombros estimado (m) para márgenes laterales. */
  shoulderWidth: 0.48,
} as const;

export type AvatarCameraFrame = {
  centerY: number;
  height: number;
  distance: number;
};

/** Distancia fija para que 150 cm y 180 cm se distingan visualmente. */
const FITTING_CAMERA_DISTANCE = 4.15;

/**
 * Cámara tras normalizar (pies en Y=0).
 * Distancia fija: avatares más bajos se ven más pequeños en pantalla.
 */
export function computeCanonicalAvatarCameraFrame(
  gender: AvatarGender,
  heightScale: number,
  camera: PerspectiveCamera,
  viewportAspect: number,
): AvatarCameraFrame {
  const config = getAvatarModelConfig(gender);
  const height = config.targetHeight * heightScale;
  const centerY =
    height * 0.5 + height * FITTING_VIEW.lookAtYOffsetRatio;

  return {
    centerY,
    height,
    distance: FITTING_CAMERA_DISTANCE,
  };
}
