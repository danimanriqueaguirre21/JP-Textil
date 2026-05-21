import {
  compareSizeToChest,
  fitLevelColor,
  rankSizesForChest,
} from "./size-fit";

describe("size-fit", () => {
  it("marks close chest as perfect fit", () => {
    const r = compareSizeToChest("M", 99);
    expect(r.level).toBe("perfect");
    expect(r.label).toBe("Ajustado");
  });

  it("ranks sizes by proximity to chest", () => {
    const ranked = rankSizesForChest(100);
    expect(ranked[0].size).toBe("M");
  });

  it("flags loose and tight fits", () => {
    expect(compareSizeToChest("XL", 90).level).toBe("loose");
    expect(compareSizeToChest("XS", 110).level).toBe("tight");
  });

  it("returns tailwind color classes per level", () => {
    expect(fitLevelColor("perfect")).toContain("emerald");
    expect(fitLevelColor("regular")).toContain("amber");
    expect(fitLevelColor("loose")).toContain("red");
    expect(fitLevelColor("tight")).toContain("red");
  });
});
