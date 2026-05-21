import { render, screen } from "@testing-library/react";

import type { Product } from "@/types/commerce";

import { ProductCard } from "./product-card";

const sample: Product = {
  id: "1",
  slug: "test-product",
  name: "Test Tee",
  description: "d",
  category: "Polera",
  categorySlug: "polera",
  priceCents: 9900,
  currency: "PEN",
  images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"],
  sizes: ["M"],
};

describe("ProductCard", () => {
  it("renders name and links to product", () => {
    render(<ProductCard product={sample} />);
    expect(screen.getByText("Test Tee")).toBeInTheDocument();
    const anchor = screen.getByText("Test Tee").closest("a");
    expect(anchor).toHaveAttribute("href", "/product/test-product");
  });

  it("renders without image when list is empty", () => {
    render(<ProductCard product={{ ...sample, images: [] }} />);
    expect(screen.getByText("Test Tee")).toBeInTheDocument();
  });
});
