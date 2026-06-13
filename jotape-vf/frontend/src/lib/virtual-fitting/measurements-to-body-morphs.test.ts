import { computeAvatarZoneScales } from "@/lib/body-scan/avatar-zone-scales";
import {
  fusedToMorphInfluences,
  zoneScalesToMorphInfluences,
} from "@/lib/virtual-fitting/measurements-to-body-morphs";
import type { FusedBodyMeasurements } from "@/types/avatar-calibration";

const average: FusedBodyMeasurements = {
  heightCm: 170,
  shoulderWidthCm: 44,
  hipWidthCm: 98,
  waistCm: 78,
  chestCm: 96,
  depthCm: 24,
  armLengthCm: 58,
  legLengthCm: 82,
  torsoLengthCm: 48,
  poseQuality: 0.9,
};

const overweight: FusedBodyMeasurements = {
  ...average,
  heightCm: 162,
  waistCm: 98,
  chestCm: 108,
  hipWidthCm: 112,
  depthCm: 30,
  shoulderWidthCm: 48,
};

describe("zoneScalesToMorphInfluences", () => {
  it("is near zero for reference proportions", () => {
    const z = computeAvatarZoneScales(average);
    const m = zoneScalesToMorphInfluences(z);
    expect(Math.abs(m.belly)).toBeLessThan(0.08);
    expect(Math.abs(m.chest)).toBeLessThan(0.08);
  });

  it("increases belly and waist for overweight scan", () => {
    const m = fusedToMorphInfluences(overweight);
    expect(m.belly).toBeGreaterThan(0.12);
    expect(m.waist).toBeGreaterThan(0.12);
    expect(m.hip).toBeGreaterThan(0.08);
  });

  it("can reduce influences for thin proportions", () => {
    const thin = computeAvatarZoneScales({
      ...average,
      waistCm: 68,
      chestCm: 88,
      hipWidthCm: 88,
      depthCm: 20,
    });
    const m = zoneScalesToMorphInfluences(thin);
    expect(m.waist).toBeLessThan(0);
    expect(m.belly).toBeLessThan(0);
  });
});
