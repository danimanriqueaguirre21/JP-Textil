import type { Product } from "@/types/commerce";

import { ProductCard } from "./product-card";

type Props = {
  products: Product[];
};

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-zinc-600 dark:text-zinc-400">
        No products in this collection yet.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
