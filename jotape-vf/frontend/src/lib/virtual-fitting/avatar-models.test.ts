import { AVATAR_MODEL_URL, getAvatarModelConfig } from "./avatar-models";
import { GARMENT_SHORTS_GLB, GARMENT_TSHIRT_GLB } from "./garment-models";

describe("avatar-models", () => {
  it("exposes glb paths per gender", () => {
    expect(AVATAR_MODEL_URL.male).toMatch(/male\.glb$/);
    expect(AVATAR_MODEL_URL.female).toMatch(/female\.glb$/);
  });

  it("uses different target heights for male and female", () => {
    const male = getAvatarModelConfig("male");
    const female = getAvatarModelConfig("female");
    expect(male.targetHeight).toBeGreaterThan(female.targetHeight);
  });

  it("points garments to real glb assets", () => {
    expect(GARMENT_TSHIRT_GLB).toMatch(/tshirt\.glb$/);
    expect(GARMENT_SHORTS_GLB).toMatch(/shorts\.glb$/);
  });
});
