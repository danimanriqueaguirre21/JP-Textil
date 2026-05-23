import {
  CLOTHING_SHORTS_GLB,
  CLOTHING_TSHIRT_GLB,
} from "@/lib/clothing/clothing-paths";
import { AVATAR_MODEL_URL } from "./avatar-models";

describe("avatar-models", () => {
  it("points avatars to local glb", () => {
    expect(AVATAR_MODEL_URL.male).toMatch(/male\.glb$/);
    expect(AVATAR_MODEL_URL.female).toMatch(/female\.glb$/);
  });

  it("points clothing to real glb assets", () => {
    expect(CLOTHING_TSHIRT_GLB).toBe("/models/clothing/tshirt.glb");
    expect(CLOTHING_SHORTS_GLB).toBe("/models/clothing/shorts.glb");
  });
});
