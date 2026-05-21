import { catalogService } from "./catalog.service";

describe("catalogService", () => {
  it("lists products and finds by slug", () => {
    const all = catalogService.listAll();
    expect(all.length).toBeGreaterThan(0);
    const first = all[0]!;
    expect(catalogService.getBySlug(first.slug)?.name).toBe(first.name);
  });

  it("searches by name", () => {
    const hits = catalogService.search("Huancayo");
    expect(hits.some((p) => p.name.toLowerCase().includes("huancayo"))).toBe(true);
  });

  it("filters featured", () => {
    const featured = catalogService.listFeatured();
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("lists by category including all", () => {
    expect(catalogService.listByCategory("all").length).toBeGreaterThan(0);
    expect(catalogService.listByCategory("oversize").length).toBeGreaterThan(0);
  });

  it("exposes category labels", () => {
    expect(catalogService.categoryLabels().oversize).toBe("Oversize");
  });
});
