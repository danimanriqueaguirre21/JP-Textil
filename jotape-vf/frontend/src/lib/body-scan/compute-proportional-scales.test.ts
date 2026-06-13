import { classifyBodyType, computeBodyFatEstimate } from "@/lib/body-scan/classify-body-type";
import { computeHeightCalibration } from "@/lib/body-scan/height-calibration";
import { computeProportionalScales } from "@/lib/body-scan/compute-proportional-scales";
import { POSE_LANDMARK } from "@/lib/virtual-fitting/pose-landmarks";
import type { PoseLandmark } from "@/types/virtual-fitting";

describe("computeHeightCalibration", () => {
  it("computes cmPerPixel from nose to ankles", () => {
    const landmarks = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0,
      visibility: 1,
    })) as PoseLandmark[];

    landmarks[POSE_LANDMARK.NOSE] = { x: 0.5, y: 0.12, z: 0, visibility: 1 };
    landmarks[POSE_LANDMARK.LEFT_ANKLE] = { x: 0.48, y: 0.92, z: 0, visibility: 1 };
    landmarks[POSE_LANDMARK.RIGHT_ANKLE] = { x: 0.52, y: 0.92, z: 0, visibility: 1 };

    const cal = computeHeightCalibration(landmarks, 170, 1000);
    expect(cal).not.toBeNull();
    expect(cal!.pixelHeight).toBeGreaterThan(700);
    expect(cal!.cmPerPixel).toBeGreaterThan(0.15);
    expect(cal!.cmPerPixel).toBeLessThan(0.25);
  });
});

describe("classifyBodyType", () => {
  const base = {
    heightCm: 170,
    chestCm: 96,
    waistCm: 78,
    hipCm: 98,
    depthCm: 24,
    abdomenDepthCm: 26,
    shoulderWidthCm: 44,
  };

  it("classifies obese when waist > 110", () => {
    const fat = computeBodyFatEstimate({ ...base, waistCm: 115 });
    expect(classifyBodyType({ ...base, waistCm: 115 }, fat)).toBe("OBESE");
  });

  it("classifies overweight for waist 95-110", () => {
    const fat = computeBodyFatEstimate({ ...base, waistCm: 102 });
    expect(classifyBodyType({ ...base, waistCm: 102 }, fat)).toBe("OVERWEIGHT");
  });

  it("never classifies SLIM when BMI > 30", () => {
    const input = { ...base, waistCm: 70, weightKg: 100, heightCm: 160 };
    const fat = computeBodyFatEstimate(input);
    const type = classifyBodyType(input, fat);
    expect(type).not.toBe("SLIM");
    expect(type).toBe("OBESE");
  });
});

describe("computeProportionalScales hybrid", () => {
  const base = {
    heightCm: 160,
    shoulderWidthCm: 48,
    chestCm: 120,
    waistCm: 115,
    hipWidthCm: 118,
    depthCm: 32,
    abdomenDepthCm: 34,
    thighWidthCm: 42,
    torsoLengthCm: 46,
    legLengthCm: 78,
    poseQuality: 0.8,
    hasSideView: true,
    segmentationUsed: true,
  };

  it("boosts waist and depth for OBESE body type", () => {
    const moderate = {
      ...base,
      waistCm: 98,
      chestCm: 108,
      depthCm: 26,
      abdomenDepthCm: 27,
      bodyFatEstimate: 0.4,
    };
    const average = computeProportionalScales({
      ...moderate,
      bodyType: "AVERAGE",
    });
    const obese = computeProportionalScales({
      ...moderate,
      bodyType: "OBESE",
      bodyFatEstimate: 0.78,
    });

    expect(obese.scales.waistScaleX).toBeGreaterThanOrEqual(average.scales.waistScaleX);
    expect(obese.scales.armScaleX).toBeGreaterThan(average.scales.armScaleX);
    expect(obese.scales.thighScaleX).toBeGreaterThan(average.scales.thighScaleX);
    expect(obese.debug.bodyType).toBe("OBESE");
  });
});
