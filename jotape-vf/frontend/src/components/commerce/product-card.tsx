import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/format";
import type { Product } from "@/types/commerce";

type Props = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: Props) {
  const src = product.images[0] ?? "";
  return (
    <Link
      href={`/product/${product.slug}`}
      className={
        className ??
        "jp-hover-lift group rounded-3xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-700"
      }
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
        <Image
          src={src}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="space-y-1 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          {product.category}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {product.name}
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            {formatMoney(product.priceCents, product.currency)}
          </div>
        </div>
      </div>
    </Link>
  );
}
