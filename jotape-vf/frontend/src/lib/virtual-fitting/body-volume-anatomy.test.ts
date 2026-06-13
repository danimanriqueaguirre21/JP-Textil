import {
  bodyFatToPreset,
  clampHandScale,
  effectiveMuscleLevel,
  FAT_ZONE_WEIGHT,
} from "@/lib/virtual-fitting/body-volume-anatomy";
import { buildAnatomicalVolumeScales } from "@/lib/virtual-fitting/compute-body-volume-params";

describe("body-volume-anatomy", () => {
  it("fat distribution weights sum to 1", () => {
    const sum =
      FAT_ZONE_WEIGHT.abdomen +
      FAT_ZONE_WEIGHT.chest +
      FAT_ZONE_WEIGHT.hips +
      FAT_ZONE_WEIGHT.thigh +
      FAT_ZONE_WEIGHT.upperArm;
    expect(sum).toBeCloseTo(1, 5);
  });

  it("obese torso deeper than wide", () => {
    const z = buildAnatomicalVolumeScales({
      bodyFat: 0.95,
      muscle: 0,
      shoulderWidth: 0.5,
      hipWidth: 0.5,
      preset: "obese",
    });
    expect(z.abdomen.z / z.abdomen.x).toBeGreaterThan(1.08);
  });

  it("muscle does not inflate abdomen", () => {
    const lean = buildAnatomicalVolumeScales({
      bodyFat: 0.35,
      muscle: 0.9,
      shoulderWidth: 0.6,
      hipWidth: 0.5,
      preset: "average",
    });
    const fatOnly = buildAnatomicalVolumeScales({
      bodyFat: 0.35,
      muscle: 0,
      shoulderWidth: 0.5,
      hipWidth: 0.5,
      preset: "average",
    });
    expect(lean.abdomen.z).toBeCloseTo(fatOnly.abdomen.z, 2);
    expect(lean.chest.x).toBeGreaterThanOrEqual(fatOnly.chest.x);
  });

  it("hands stay neutral", () => {
    const z = buildAnatomicalVolumeScales({
      bodyFat: 1,
      muscle: 0,
      shoulderWidth: 0.5,
      hipWidth: 0.5,
      preset: "obese",
    });
    expect(z.hand.x).toBe(clampHandScale(1));
  });

  it("preset thresholds", () => {
    expect(bodyFatToPreset(0.9)).toBe("obese");
    expect(effectiveMuscleLevel(1, 0.85)).toBeLessThan(0.2);
  });
});
