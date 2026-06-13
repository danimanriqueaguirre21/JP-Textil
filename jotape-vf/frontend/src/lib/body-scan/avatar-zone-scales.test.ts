import {
  computeAvatarZoneScales,
  REFERENCE_ANTHRO,
  withDefaultZoneScales,
} from "@/lib/body-scan/avatar-zone-scales";
import type { FusedBodyMeasurements } from "@/types/avatar-calibration";

const fused: FusedBodyMeasurements = {
  heightCm: 178,
  shoulderWidthCm: 46,
  hipWidthCm: 100,
  waistCm: 80,
  chestCm: 98,
  depthCm: 26,
  armLengthCm: 60,
  legLengthCm: 85,
  torsoLengthCm: 50,
  poseQuality: 0.9,
};

describe("computeAvatarZoneScales", () => {
  it("maps measurements to per-zone scales vs reference", () => {
    const z = computeAvatarZoneScales(fused);
    expect(z.shoulder).toBeCloseTo(46 / REFERENCE_ANTHRO.shoulder, 2);
    expect(z.chest).toBeCloseTo(98 / REFERENCE_ANTHRO.chest, 2);
    expect(z.waist).toBeCloseTo(80 / REFERENCE_ANTHRO.waist, 2);
    expect(z.arm).toBeCloseTo(60 / REFERENCE_ANTHRO.arm, 2);
    expect(z.leg).toBeCloseTo(85 / REFERENCE_ANTHRO.leg, 2);
    expect(z.neck).toBeGreaterThan(0.85);
  });

  it("clamps extreme values", () => {
    const extreme = computeAvatarZoneScales({
      ...fused,
      shoulderWidthCm: 20,
      legLengthCm: 120,
    });
    expect(extreme.shoulder).toBeGreaterThanOrEqual(0.86);
    expect(extreme.leg).toBeLessThanOrEqual(1.12);
  });
});

describe("withDefaultZoneScales", () => {
  it("fills missing zones from shoulder/depth legacy", () => {
    const z = withDefaultZoneScales({ shoulder: 1.05, depth: 0.95 });
    expect(z.shoulder).toBe(1.05);
    expect(z.depth).toBe(0.95);
    expect(z.chest).toBeGreaterThan(1);
    expect(z.arm).toBe(1);
  });
});
