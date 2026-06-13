import { calculateBodyMeasurements } from "@/lib/virtual-fitting/measurement-calculator";
import { POSE_LANDMARK } from "@/lib/virtual-fitting/pose-landmarks";
import type { PoseLandmark } from "@/types/virtual-fitting";

function mockLandmarks(): PoseLandmark[] {
  const lm = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 1,
  })) as PoseLandmark[];

  lm[POSE_LANDMARK.NOSE] = { x: 0.5, y: 0.1, z: 0, visibility: 1 };
  lm[POSE_LANDMARK.LEFT_SHOULDER] = { x: 0.38, y: 0.22, z: 0, visibility: 1 };
  lm[POSE_LANDMARK.RIGHT_SHOULDER] = { x: 0.62, y: 0.22, z: 0, visibility: 1 };
  lm[POSE_LANDMARK.LEFT_HIP] = { x: 0.42, y: 0.48, z: 0, visibility: 1 };
  lm[POSE_LANDMARK.RIGHT_HIP] = { x: 0.58, y: 0.48, z: 0, visibility: 1 };
  lm[POSE_LANDMARK.LEFT_ANKLE] = { x: 0.43, y: 0.92, z: 0, visibility: 1 };
  lm[POSE_LANDMARK.RIGHT_ANKLE] = { x: 0.57, y: 0.92, z: 0, visibility: 1 };
  return lm;
}

describe("calculateBodyMeasurements", () => {
  it("waist is a width in cm, not width×height product", () => {
    const m = calculateBodyMeasurements(mockLandmarks(), 160);
    expect(m).not.toBeNull();
    expect(m!.waistEstimateCm).toBeGreaterThan(40);
    expect(m!.waistEstimateCm).toBeLessThan(m!.shoulderWidthCm * 2.5);
    expect(m!.shoulderWidthCm).toBeGreaterThan(30);
  });
});
