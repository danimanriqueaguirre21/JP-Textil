import {
  getProductBySlug,
  getProductsByCategorySlug,
  searchProducts,
} from "./products";

describe("products data", () => {
  it("finds product by slug", () => {
    const p = getProductBySlug("polera-oversize-negra");
    expect(p?.slug).toBe("polera-oversize-negra");
  });

  it("filters by category", () => {
    const oversize = getProductsByCategorySlug("oversize");
    expect(oversize.every((p) => p.categorySlug === "oversize")).toBe(true);
  });

  it("searches empty query as full list", () => {
    expect(searchProducts("").length).toBeGreaterThan(5);
  });
});
