import { POSE_LANDMARK } from "@/lib/virtual-fitting/pose-landmarks";
import type { HeightCalibration } from "@/types/hybrid-body-scan";
import type { PoseLandmark } from "@/types/virtual-fitting";

/**
 * Fase 1: calibración altura real → cm por píxel.
 * pixelHeight = distancia cabeza (nariz) → tobillos en píxeles.
 */
export function computeHeightCalibration(
  landmarks: PoseLandmark[],
  heightCm: number,
  imageHeightPx: number,
): HeightCalibration | null {
  const nose = landmarks[POSE_LANDMARK.NOSE];
  const la = landmarks[POSE_LANDMARK.LEFT_ANKLE];
  const ra = landmarks[POSE_LANDMARK.RIGHT_ANKLE];
  if (!nose || !la || !ra || heightCm <= 0) return null;

  const ankleY = ((la.y + ra.y) / 2) * imageHeightPx;
  const noseY = nose.y * imageHeightPx;
  const pixelHeight = Math.max(40, Math.abs(ankleY - noseY));
  const cmPerPixel = heightCm / pixelHeight;

  return {
    heightCm,
    pixelHeight: Math.round(pixelHeight),
    cmPerPixel,
  };
}

export function logHeightCalibration(cal: HeightCalibration): void {
  if (typeof window === "undefined") return;
  console.table({
    altura_cm: cal.heightCm,
    pixelHeight: cal.pixelHeight,
    cmPerPixel: Number(cal.cmPerPixel.toFixed(4)),
  });
}
