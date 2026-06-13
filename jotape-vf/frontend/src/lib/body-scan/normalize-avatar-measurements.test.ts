import {
  BASE_HEIGHT_CM,
  normalizeAvatarMeasurements,
} from "@/lib/body-scan/normalize-avatar-measurements";

describe("normalizeAvatarMeasurements", () => {
  it("computes heightScale from BASE_HEIGHT_CM", () => {
    const n150 = normalizeAvatarMeasurements({ heightCm: 150 });
    const n180 = normalizeAvatarMeasurements({ heightCm: 180 });
    expect(n150.heightScale).toBeCloseTo(150 / BASE_HEIGHT_CM, 3);
    expect(n180.heightScale).toBeCloseTo(180 / BASE_HEIGHT_CM, 3);
    expect(n180.heightScale - n150.heightScale).toBeGreaterThan(0.15);
  });

  it("rejects absurd waist and chest from bad fusion", () => {
    const n = normalizeAvatarMeasurements({
      heightCm: 170,
      shoulderWidthCm: 44,
      waistCm: 4,
      chestCm: 35,
      hipWidthCm: 98,
    });
    expect(n.waistCm).toBeGreaterThanOrEqual(45);
    expect(n.chestCm).toBeGreaterThanOrEqual(50);
  });
});
