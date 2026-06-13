import { computeProportionalScales } from "@/lib/body-scan/compute-proportional-scales";
import {
  BODY_VISUAL_PRESETS,
  MEASURED_BLEND_WEIGHT,
  resolveAvatarVisualScales,
} from "@/lib/body-scan/body-visual-presets";
import type { ProportionalAvatarScales } from "@/types/proportional-scales";

describe("body-visual-presets", () => {
  const extremeRaw: ProportionalAvatarScales = {
    shoulderScaleX: 1.4,
    chestScaleX: 1.55,
    waistScaleX: 1.8,
    hipScaleX: 1.6,
    torsoScaleY: 1.27,
    legScaleY: 1.12,
    bodyDepthZ: 2,
    chestDepthZ: 1.8,
    abdomenDepthZ: 2.2,
    armScaleX: 2.97,
    thighScaleX: 1.96,
  };

  it("OBESE preset matches safe anatomical targets", () => {
    expect(BODY_VISUAL_PRESETS.OBESE).toMatchObject({
      shoulderScaleX: 1.12,
      chestScaleX: 1.18,
      waistScaleX: 1.32,
      hipScaleX: 1.25,
      bodyDepthZ: 1.3,
      chestDepthZ: 1.22,
      abdomenDepthZ: 1.45,
      armScaleX: 1.18,
      thighScaleX: 1.22,
      torsoScaleY: 1,
      legScaleY: 1,
    });
  });

  it("blends 75% preset + 25% measured for OBESE", () => {
    const res = resolveAvatarVisualScales(extremeRaw, "OBESE");
    expect(res.blendWeight).toBe(MEASURED_BLEND_WEIGHT);
    expect(res.presetKey).toBe("OBESE");
    expect(res.final.armScaleX).toBeLessThanOrEqual(1.25);
    expect(res.final.thighScaleX).toBeLessThanOrEqual(1.25);
    expect(res.final.torsoScaleY).toBe(1);
    expect(res.final.legScaleY).toBe(1);
    expect(res.final.waistScaleX).toBeGreaterThan(BODY_VISUAL_PRESETS.OBESE.waistScaleX);
    expect(res.final.waistScaleX).toBeLessThan(extremeRaw.waistScaleX);
  });

  it("never applies raw extreme arm/thigh to final", () => {
    const res = resolveAvatarVisualScales(extremeRaw, "OBESE");
    expect(res.final.armScaleX).toBeLessThan(1.3);
    expect(res.final.thighScaleX).toBeLessThan(1.3);
  });
});

describe("computeProportionalScales with presets", () => {
  it("returns preset-based final scales for obese profile", () => {
    const { scales, visual, rawScales } = computeProportionalScales({
      heightCm: 160,
      shoulderWidthCm: 48,
      chestCm: 142,
      waistCm: 129,
      hipWidthCm: 145,
      depthCm: 30,
      abdomenDepthCm: 51.6,
      thighWidthCm: 45,
      torsoLengthCm: 61,
      legLengthCm: 78,
      poseQuality: 0.85,
      hasSideView: true,
      bodyType: "OBESE",
      bodyFatEstimate: 0.8,
      segmentationUsed: true,
    });

    expect(visual.presetKey).toBe("OBESE");
    expect(scales.armScaleX).toBeLessThanOrEqual(1.25);
    expect(scales.thighScaleX).toBeLessThanOrEqual(1.25);
    expect(scales.torsoScaleY).toBe(1);
    expect(rawScales.armScaleX).toBeGreaterThan(scales.armScaleX);
  });
});
