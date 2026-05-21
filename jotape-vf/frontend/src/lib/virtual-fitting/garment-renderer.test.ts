import { computeGarmentDrawParams } from "./garment-renderer";
import { POSE_LANDMARK } from "./pose-landmarks";
import type { PoseLandmark } from "@/types/virtual-fitting";

function mockLandmarks(): PoseLandmark[] {
  const base: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 0.9,
  }));
  base[POSE_LANDMARK.LEFT_SHOULDER] = { x: 0.4, y: 0.3, visibility: 0.9 };
  base[POSE_LANDMARK.RIGHT_SHOULDER] = { x: 0.6, y: 0.3, visibility: 0.9 };
  base[POSE_LANDMARK.LEFT_HIP] = { x: 0.42, y: 0.55, visibility: 0.9 };
  base[POSE_LANDMARK.RIGHT_HIP] = { x: 0.58, y: 0.55, visibility: 0.9 };
  return base;
}

describe("garment-renderer", () => {
  it("computes draw params from landmarks", () => {
    const params = computeGarmentDrawParams(mockLandmarks(), 400, 600, 1);
    expect(params).not.toBeNull();
    expect(params!.torsoWidth).toBeGreaterThan(0);
  });

});
