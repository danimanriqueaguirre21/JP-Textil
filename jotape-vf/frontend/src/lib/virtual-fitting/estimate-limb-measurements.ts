import type { PoseLandmark } from "@/types/virtual-fitting";

import { POSE_LANDMARK } from "./pose-landmarks";
import { landmarkDistance } from "./measurement-calculator";

function dist(a: PoseLandmark, b: PoseLandmark): number {
  return landmarkDistance(a, b);
}

function limbScale(landmarks: PoseLandmark[], heightCm: number): number {
  const nose = landmarks[POSE_LANDMARK.NOSE];
  const la = landmarks[POSE_LANDMARK.LEFT_ANKLE];
  const ra = landmarks[POSE_LANDMARK.RIGHT_ANKLE];
  if (!nose || !la || !ra) return heightCm / 170;
  const bodyH = Math.max(0.15, Math.abs((la.y + ra.y) / 2 - nose.y));
  return heightCm / bodyH;
}

/**
 * Brazo y pierna en cm a partir de landmarks MediaPipe (frontal o lateral).
 */
export function estimateLimbMeasurements(
  landmarks: PoseLandmark[],
  referenceHeightCm: number,
): {
  armLengthCm: number;
  legLengthCm: number;
  torsoLengthCm: number;
} | null {
  const ls = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];
  const le = landmarks[POSE_LANDMARK.LEFT_ELBOW];
  const re = landmarks[POSE_LANDMARK.RIGHT_ELBOW];
  const lw = landmarks[POSE_LANDMARK.LEFT_WRIST];
  const rw = landmarks[POSE_LANDMARK.RIGHT_WRIST];
  const lh = landmarks[POSE_LANDMARK.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARK.RIGHT_HIP];
  const lk = landmarks[POSE_LANDMARK.LEFT_KNEE];
  const rk = landmarks[POSE_LANDMARK.RIGHT_KNEE];
  const la = landmarks[POSE_LANDMARK.LEFT_ANKLE];
  const ra = landmarks[POSE_LANDMARK.RIGHT_ANKLE];

  if (!ls || !rs || !lh || !rh) return null;

  const scale = limbScale(landmarks, referenceHeightCm);

  const armLeft =
    le && lw ? dist(ls, le) + dist(le, lw) : le ? dist(ls, le) * 2.2 : 0;
  const armRight =
    re && rw ? dist(rs, re) + dist(re, rw) : re ? dist(rs, re) * 2.2 : 0;
  const armNorm = armLeft && armRight ? (armLeft + armRight) / 2 : armLeft || armRight;

  const legLeft =
    lk && la ? dist(lh, lk) + dist(lk, la) : la ? dist(lh, la) * 0.92 : 0;
  const legRight =
    rk && ra ? dist(rh, rk) + dist(rk, ra) : ra ? dist(rh, ra) * 0.92 : 0;
  const legNorm = legLeft && legRight ? (legLeft + legRight) / 2 : legLeft || legRight;

  const shoulderY = (ls.y + rs.y) / 2;
  const hipY = (lh.y + rh.y) / 2;
  const torsoNorm = Math.abs(hipY - shoulderY);

  if (!armNorm && !legNorm) return null;

  return {
    armLengthCm: Math.round(Math.max(armNorm, 0.12) * scale),
    legLengthCm: Math.round(Math.max(legNorm, 0.2) * scale),
    torsoLengthCm: Math.round(Math.max(torsoNorm, 0.15) * scale),
  };
}
