import { validateBodyScanPose } from "@/lib/body-scan/body-scan-pose-validation";
import type { PoseLandmark } from "@/types/virtual-fitting";

function lm(
  x: number,
  y: number,
  visibility = 0.9,
): PoseLandmark {
  return { x, y, visibility };
}

function fullBodyLandmarks(): PoseLandmark[] {
  const landmarks: PoseLandmark[] = [];
  landmarks[0] = lm(0.5, 0.08);
  landmarks[11] = lm(0.42, 0.22);
  landmarks[12] = lm(0.58, 0.22);
  landmarks[23] = lm(0.44, 0.48);
  landmarks[24] = lm(0.56, 0.48);
  landmarks[27] = lm(0.45, 0.88);
  landmarks[28] = lm(0.55, 0.88);
  return landmarks;
}

describe("validateBodyScanPose", () => {
  it("accepts a well-framed front pose", () => {
    const result = validateBodyScanPose(fullBodyLandmarks(), "front");
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects empty landmarks", () => {
    const result = validateBodyScanPose([], "front");
    expect(result.valid).toBe(false);
  });

  it("flags narrow shoulder span on front view", () => {
    const landmarks = fullBodyLandmarks();
    landmarks[11] = lm(0.49, 0.22);
    landmarks[12] = lm(0.51, 0.22);
    const result = validateBodyScanPose(landmarks, "front");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("brazos"))).toBe(true);
  });
});
