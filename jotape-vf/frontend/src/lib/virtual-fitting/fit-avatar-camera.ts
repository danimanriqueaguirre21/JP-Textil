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

/**
 * Cámara tras normalizar (pies en Y=0, altura = targetHeight).
 * Mismo encuadre para ambos géneros.
 */
export function computeCanonicalAvatarCameraFrame(
  gender: AvatarGender,
  heightScale: number,
  camera: PerspectiveCamera,
  viewportAspect: number,
): AvatarCameraFrame {
  const config = getAvatarModelConfig(gender);
  const height = config.targetHeight * heightScale;
  const frameHeight = height * (1 + FITTING_VIEW.headMarginRatio);
  const centerY =
    height * 0.5 + height * FITTING_VIEW.lookAtYOffsetRatio;
  const padding = 1 / FITTING_VIEW.verticalFill;

  const vFovRad = (camera.fov * Math.PI) / 180;
  const distV = (frameHeight * padding) / (2 * Math.tan(vFovRad / 2));
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * viewportAspect);
  const distH =
    (FITTING_VIEW.shoulderWidth * padding) / (2 * Math.tan(hFovRad / 2));
  const distance = Math.max(distV, distH, 3.5);

  return { centerY, height, distance };
}
