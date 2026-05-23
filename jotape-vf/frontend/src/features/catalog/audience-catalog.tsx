"use client";

import { ProductGrid } from "@/components/commerce/product-grid";
import {
  listProductsByAudience,
  type ShopAudience,
} from "@/lib/catalog/audience";

type Props = {
  audience: ShopAudience;
};

export function AudienceCatalog({ audience }: Props) {
  const products = listProductsByAudience(audience);
  return <ProductGrid products={products} />;
}
