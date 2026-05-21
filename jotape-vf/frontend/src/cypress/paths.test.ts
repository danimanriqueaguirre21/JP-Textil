import { paths } from "./paths";

describe("paths", () => {
  it("exposes store routes", () => {
    expect(paths.home).toBe("/");
    expect(paths.tryOn).toBe("/try-on");
    expect(paths.product("polera-oversize-negra")).toBe(
      "/product/polera-oversize-negra",
    );
  });
});
