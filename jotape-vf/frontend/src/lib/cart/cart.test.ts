import { PRODUCTS } from "@/lib/data/products";

import {
  addLine,
  cartCurrency,
  cartItemCount,
  cartSubtotalCents,
  createCartLine,
  parseCartJson,
  removeLine,
  serializeCart,
} from "./cart";

const product = PRODUCTS[0]!;

describe("cart", () => {
  it("creates a line from product and size", () => {
    const line = createCartLine(product, "M");
    expect(line.productSlug).toBe(product.slug);
    expect(line.size).toBe("M");
    expect(line.quantity).toBe(1);
  });

  it("merges quantity when adding same sku", () => {
    const once = addLine([], product, "M");
    const twice = addLine(once, product, "M");
    expect(cartItemCount(twice)).toBe(2);
    expect(twice).toHaveLength(1);
  });

  it("removes a line by id", () => {
    const lines = addLine([], product, "M");
    const id = lines[0]!.id;
    expect(removeLine(lines, id)).toHaveLength(0);
  });

  it("computes subtotal in centavos", () => {
    const lines = addLine([], product, "M", 2);
    expect(cartSubtotalCents(lines)).toBe(product.priceCents * 2);
  });

  it("returns empty cart for invalid json", () => {
    expect(parseCartJson(null)).toEqual([]);
    expect(parseCartJson("{not-json")).toEqual([]);
    expect(parseCartJson('{"lines":"x"}')).toEqual([]);
  });

  it("defaults currency to PEN when cart is empty", () => {
    expect(cartCurrency([])).toBe("PEN");
    const lines = addLine([], product, "M");
    expect(cartCurrency(lines)).toBe("PEN");
  });

  it("round-trips localStorage payload", () => {
    const lines = addLine([], product, "L");
    const raw = serializeCart(lines);
    expect(parseCartJson(raw)).toEqual(lines);
  });
});
