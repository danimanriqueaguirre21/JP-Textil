import { recommendSize } from "./recommender";

describe("recommendSize", () => {
  it("returns a size and confidence for typical input", () => {
    const result = recommendSize({
      heightCm: 170,
      weightKg: 70,
      fit: "regular",
      gender: "male",
    });
    expect(["XS", "S", "M", "L", "XL"]).toContain(result.size);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.estChestCm).toBeGreaterThan(0);
  });
});
