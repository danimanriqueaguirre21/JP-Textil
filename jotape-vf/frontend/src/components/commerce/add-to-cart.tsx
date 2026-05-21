"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types/commerce";

type Props = {
  product: Product;
};

export function AddToCart({ product }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const querySize = searchParams.get("size");
  const initialSize =
    querySize && product.sizes.includes(querySize)
      ? querySize
      : (product.sizes[0] ?? "M");
  const [size, setSize] = useState(initialSize);

  return (
    <div className="space-y-4" data-testid="add-to-cart-block">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Talla
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              data-testid={`size-${s}`}
              onClick={() => setSize(s)}
              className={`min-w-[2.75rem] rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                size === s
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <Button
        type="button"
        data-testid="add-to-cart"
        className="w-full rounded-full"
        onClick={() => {
          addItem(product, size);
          router.push("/cart");
        }}
      >
        Añadir a la bolsa
      </Button>
    </div>
  );
}
