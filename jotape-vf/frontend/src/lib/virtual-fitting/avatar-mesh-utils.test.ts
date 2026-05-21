import { isAvatarClothingMesh } from "./avatar-mesh-utils";

describe("avatar-mesh-utils", () => {
  it("detects clothing mesh names", () => {
    expect(isAvatarClothingMesh("Outfit_Top")).toBe(true);
    expect(isAvatarClothingMesh("Body_Skin")).toBe(false);
  });
});
