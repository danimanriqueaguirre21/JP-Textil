import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import type { Product } from "@/types/commerce";

import { CartProvider, useCartStore } from "./cart-context";

const product: Product = {
  id: "t1",
  slug: "polera-test",
  name: "Polera Test",
  description: "Test",
  category: "Test",
  categorySlug: "test",
  priceCents: 1000,
  currency: "PEN",
  images: ["/img.jpg"],
  sizes: ["S", "M"],
};

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds, updates quantity, removes and clears lines", () => {
    const { result } = renderHook(() => useCartStore(), { wrapper });

    act(() => {
      result.current.addItem(product, "M", 2);
    });
    expect(result.current.itemCount).toBe(2);
    expect(result.current.lines[0]?.size).toBe("M");

    act(() => {
      result.current.addItem(product, "M", 1);
    });
    expect(result.current.itemCount).toBe(3);

    const lineId = result.current.lines[0]!.id;
    act(() => {
      result.current.setQuantity(lineId, 1);
    });
    expect(result.current.itemCount).toBe(1);

    act(() => {
      result.current.setQuantity(lineId, 0);
    });
    expect(result.current.lines).toHaveLength(0);

    act(() => {
      result.current.addItem(product, "S");
    });
    const sLineId = result.current.lines[0]!.id;
    act(() => {
      result.current.removeLine(sLineId);
    });
    expect(result.current.lines).toHaveLength(0);

    act(() => {
      result.current.addItem(product, "M");
      result.current.clear();
    });
    expect(result.current.lines).toHaveLength(0);
  });

  it("throws outside provider", () => {
    expect(() => renderHook(() => useCartStore())).toThrow(
      /CartProvider/,
    );
  });

  it("hydrates valid lines from localStorage", async () => {
    const line = {
      id: "polera-test::M",
      productSlug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      size: "M",
      priceCents: product.priceCents,
      currency: product.currency,
      quantity: 1,
    };
    localStorage.setItem("jotape-textil-cart-v1", JSON.stringify([line]));

    const { result } = renderHook(() => useCartStore(), { wrapper });
    await waitFor(() => {
      expect(result.current.lines).toHaveLength(1);
    });
  });

  it("ignores corrupt localStorage", async () => {
    localStorage.setItem("jotape-textil-cart-v1", "not-json");
    const { result } = renderHook(() => useCartStore(), { wrapper });
    await waitFor(() => {
      expect(result.current.lines).toHaveLength(0);
    });
  });
});
