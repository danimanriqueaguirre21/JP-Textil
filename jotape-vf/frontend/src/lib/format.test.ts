import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("formats PEN and USD", () => {
    expect(formatMoney(13500, "PEN")).toMatch(/135/);
    expect(formatMoney(1999, "USD")).toMatch(/20|19/);
  });

  it("defaults to PEN", () => {
    expect(formatMoney(500)).toMatch(/5/);
  });

  it("falls back locale for unknown currency codes", () => {
    expect(formatMoney(1000, "EUR" as "PEN")).toMatch(/10/);
  });
});
