import { getAvatarProportions } from "./avatar-proportions";

describe("avatar-proportions", () => {
  it("returns distinct male and female configs", () => {
    const male = getAvatarProportions("male");
    const female = getAvatarProportions("female");
    expect(male.shoulderHalfWidth).toBeGreaterThan(female.shoulderHalfWidth);
    expect(female.hipHalfWidth).toBeGreaterThan(male.hipHalfWidth);
  });
});
