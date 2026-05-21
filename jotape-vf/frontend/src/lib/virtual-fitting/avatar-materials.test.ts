import {
  createFabricMaterial,
  createHairMaterial,
  createSkinMaterial,
  getSkinNormalMap,
} from "./avatar-materials";

describe("avatar-materials", () => {
  it("creates PBR materials", () => {
    expect(createSkinMaterial().roughness).toBeLessThan(0.5);
    expect(createHairMaterial().roughness).toBeGreaterThan(0.7);
    const fabric = createFabricMaterial("#3f3f46");
    expect(fabric.roughness).toBe(0.85);
    expect(fabric.metalness).toBe(0);
    expect(fabric.wireframe).toBe(false);
  });

  it("reuses skin normal map singleton", () => {
    expect(getSkinNormalMap()).toBe(getSkinNormalMap());
  });
});
