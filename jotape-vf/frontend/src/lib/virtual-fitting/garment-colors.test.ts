import { garmentColorForSlug, GARMENT_COLOR_BY_SLUG } from "./garment-colors";

describe("garment-colors", () => {
  it("returns mapped colors for fittable slugs", () => {
    expect(garmentColorForSlug("polera-oversize-negra")).toBe(
      GARMENT_COLOR_BY_SLUG["polera-oversize-negra"],
    );
  });

  it("falls back for unknown slug", () => {
    expect(garmentColorForSlug("unknown")).toBe("#3f3f46");
  });
});
