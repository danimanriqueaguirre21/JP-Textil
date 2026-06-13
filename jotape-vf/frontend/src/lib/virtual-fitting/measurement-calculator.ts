import type { BodyMeasurements, PoseLandmark } from "@/types/virtual-fitting";

import { KEY_LANDMARK_INDICES, POSE_LANDMARK } from "./pose-landmarks";

export function landmarkDistance(a: PoseLandmark, b: PoseLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function visibilityScore(landmarks: PoseLandmark[]): number {
  const vals = KEY_LANDMARK_INDICES.map((i) => landmarks[i]?.visibility ?? 0);
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

/** Convierte proporciones del frame a cm usando altura de referencia (usuario o 170). */
export function calculateBodyMeasurements(
  landmarks: PoseLandmark[],
  referenceHeightCm = 170,
): BodyMeasurements | null {
  const ls = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARK.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARK.RIGHT_HIP];
  const nose = landmarks[POSE_LANDMARK.NOSE];
  const la = landmarks[POSE_LANDMARK.LEFT_ANKLE];
  const ra = landmarks[POSE_LANDMARK.RIGHT_ANKLE];

  if (!ls || !rs || !lh || !rh || !nose || !la || !ra) {
    return null;
  }

  const shoulderWidthNorm = landmarkDistance(ls, rs);
  const hipWidthNorm = landmarkDistance(lh, rh);
  const ankleY = (la.y + ra.y) / 2;
  const bodyHeightNorm = Math.max(0.15, Math.abs(ankleY - nose.y));

  const scale = referenceHeightCm / bodyHeightNorm;

  const shoulderMidY = (ls.y + rs.y) / 2;
  const hipMidY = (lh.y + rh.y) / 2;
  const torsoNorm = Math.max(0.12, hipMidY - shoulderMidY);

  /** Ancho frontal en cintura ≈ interpolación hombro→cadera (NO multiplicar ancho×altura). */
  const waistWidthNorm =
    shoulderWidthNorm * 0.55 + hipWidthNorm * 0.82 + torsoNorm * 0.08;

  return {
    shoulderWidthCm: Math.round(shoulderWidthNorm * scale),
    hipWidthCm: Math.round(hipWidthNorm * scale),
    waistEstimateCm: Math.round(waistWidthNorm * scale),
    heightEstimateCm: Math.round(bodyHeightNorm * scale),
    poseQuality: Math.min(1, visibilityScore(landmarks)),
  };
}

export function isPoseValid(
  landmarks: PoseLandmark[],
  minQuality = 0.45,
): boolean {
  const m = calculateBodyMeasurements(landmarks);
  return m !== null && m.poseQuality >= minQuality;
}
