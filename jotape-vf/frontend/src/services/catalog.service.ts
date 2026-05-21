import type { Product } from "@/types/commerce";

import {
  CATEGORY_LABELS,
  getFeaturedProducts,
  getProductBySlug,
  getProductsByCategorySlug,
  PRODUCTS,
  searchProducts,
} from "@/lib/data/products";

export type CatalogCategorySlug =
  | keyof typeof CATEGORY_LABELS
  | "all";

export const catalogService = {
  listAll(): Product[] {
    return PRODUCTS;
  },

  listFeatured(): Product[] {
    return getFeaturedProducts();
  },

  listByCategory(slug: CatalogCategorySlug): Product[] {
    if (slug === "all") return PRODUCTS;
    return getProductsByCategorySlug(slug);
  },

  getBySlug(slug: string): Product | undefined {
    return getProductBySlug(slug);
  },

  search(query: string): Product[] {
    return searchProducts(query);
  },

  categoryLabels(): typeof CATEGORY_LABELS {
    return CATEGORY_LABELS;
  },
};
