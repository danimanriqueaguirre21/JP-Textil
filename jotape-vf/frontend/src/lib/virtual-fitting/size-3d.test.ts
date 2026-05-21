import { garmentScaleForSize, mannequinScaleForHeight } from "./size-3d";

describe("size-3d", () => {
  it("scales garment by size", () => {
    expect(garmentScaleForSize("M")).toBe(1);
    expect(garmentScaleForSize("XL")).toBeGreaterThan(garmentScaleForSize("S"));
  });

  it("scales mannequin by height", () => {
    expect(mannequinScaleForHeight(170)).toBe(1);
    expect(mannequinScaleForHeight(190)).toBeGreaterThan(1);
  });
});
