import { computeAvatarAnatomyScales } from "@/lib/virtual-fitting/avatar-anatomy-scales";

describe("computeAvatarAnatomyScales", () => {
  it("keeps neck and head at 1", () => {
    const s = computeAvatarAnatomyScales(150 / 170);
    expect(s.neckScale).toBe(1);
    expect(s.headScale).toBe(1);
    expect(s.spineScale).toBe(1);
  });

  it("uses moderate global Y and small limb fine-tune", () => {
    const s150 = computeAvatarAnatomyScales(150 / 170);
    const s180 = computeAvatarAnatomyScales(180 / 170);
    expect(s150.avatarScaleY).toBeGreaterThan(0.88);
    expect(s150.avatarScaleY).toBeLessThan(1);
    expect(s180.avatarScaleY).toBeGreaterThan(1);
    expect(s150.legScale).toBeGreaterThan(0.95);
    expect(s150.legScale).toBeLessThan(1.02);
  });

  it("clamps extreme heights", () => {
    const s = computeAvatarAnatomyScales(120 / 170);
    expect(s.avatarScaleY).toBeGreaterThanOrEqual(0.88);
    expect(s.legScale).toBeLessThanOrEqual(1.05);
  });
});
