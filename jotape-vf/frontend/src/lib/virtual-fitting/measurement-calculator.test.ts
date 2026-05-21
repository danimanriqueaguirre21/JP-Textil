import {
  calculateBodyMeasurements,
  isPoseValid,
  landmarkDistance,
} from "./measurement-calculator";
import { POSE_LANDMARK } from "./pose-landmarks";
import type { PoseLandmark } from "@/types/virtual-fitting";

function mockLandmarks(): PoseLandmark[] {
  const base: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 0.9,
  }));
  base[POSE_LANDMARK.NOSE] = { x: 0.5, y: 0.15, visibility: 0.95 };
  base[POSE_LANDMARK.LEFT_SHOULDER] = { x: 0.4, y: 0.28, visibility: 0.9 };
  base[POSE_LANDMARK.RIGHT_SHOULDER] = { x: 0.6, y: 0.28, visibility: 0.9 };
  base[POSE_LANDMARK.LEFT_HIP] = { x: 0.42, y: 0.55, visibility: 0.9 };
  base[POSE_LANDMARK.RIGHT_HIP] = { x: 0.58, y: 0.55, visibility: 0.9 };
  base[POSE_LANDMARK.LEFT_ANKLE] = { x: 0.43, y: 0.92, visibility: 0.85 };
  base[POSE_LANDMARK.RIGHT_ANKLE] = { x: 0.57, y: 0.92, visibility: 0.85 };
  return base;
}

describe("measurement-calculator", () => {
  it("computes landmark distance", () => {
    expect(landmarkDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("returns measurements for valid pose", () => {
    const m = calculateBodyMeasurements(mockLandmarks(), 175);
    expect(m).not.toBeNull();
    expect(m!.shoulderWidthCm).toBeGreaterThan(0);
    expect(m!.poseQuality).toBeGreaterThan(0.4);
  });

  it("validates pose quality", () => {
    expect(isPoseValid(mockLandmarks())).toBe(true);
  });
});
