import { FITTABLE_SLUGS, getFittableProducts } from "./fittable-products";

describe("fittable-products", () => {
  it("returns only configured slugs", () => {
    const products = getFittableProducts();
    expect(products.length).toBe(FITTABLE_SLUGS.length);
    expect(products.every((p) => FITTABLE_SLUGS.includes(p.slug as (typeof FITTABLE_SLUGS)[number]))).toBe(
      true,
    );
  });
});
