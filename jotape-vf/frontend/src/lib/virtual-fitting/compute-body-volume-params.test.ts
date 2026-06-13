import {
  buildAnatomicalVolumeScales,
  computeBodyVolumeParams,
} from "@/lib/virtual-fitting/compute-body-volume-params";
import { effectiveMuscleLevel } from "@/lib/virtual-fitting/body-volume-anatomy";
import type { NormalizedAvatarMeasurements } from "@/lib/body-scan/normalize-avatar-measurements";

const average: NormalizedAvatarMeasurements = {
  heightCm: 170,
  chestCm: 96,
  waistCm: 78,
  hipCm: 98,
  shoulderCm: 44,
  armCm: 58,
  legCm: 82,
  depthCm: 24,
  heightScale: 1,
  widthScale: 1,
  depthScale: 1,
};

describe("computeBodyVolumeParams", () => {
  it("robust chest/waist yields high bodyFat and low muscle", () => {
    const p = computeBodyVolumeParams({
      ...average,
      heightCm: 170,
      chestCm: 133,
      waistCm: 115,
      hipCm: 118,
    });
    expect(p.bodyFat).toBeGreaterThan(0.72);
    expect(p.preset).toBe("obese");
    expect(p.muscle).toBeLessThan(0.15);
  });

  it("abdomen depth exceeds lateral width for obese", () => {
    const zones = buildAnatomicalVolumeScales({
      bodyFat: 0.92,
      muscle: 0.05,
      shoulderWidth: 0.5,
      hipWidth: 0.55,
      preset: "obese",
    });
    expect(zones.abdomen.z).toBeGreaterThan(zones.abdomen.x);
    expect(zones.chest.z).toBeGreaterThan(zones.chest.x);
    expect(zones.waist.z).toBeGreaterThan(zones.waist.x);
  });

  it("effective muscle suppressed by body fat", () => {
    expect(effectiveMuscleLevel(0.8, 0.9)).toBeLessThan(0.1);
    expect(effectiveMuscleLevel(0.8, 0.2)).toBeGreaterThan(0.4);
  });

  it("limbs stay capped", () => {
    const zones = buildAnatomicalVolumeScales({
      bodyFat: 1,
      muscle: 0,
      shoulderWidth: 0.6,
      hipWidth: 0.6,
      preset: "obese",
    });
    expect(zones.hand.x).toBeLessThanOrEqual(1.02);
    expect(zones.foreArm.x).toBeLessThanOrEqual(1.04);
    expect(zones.abdomen.z - 1).toBeGreaterThan(zones.upperArm.z - 1);
  });
});
