"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductGrid } from "@/components/commerce/product-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogCategorySlug } from "@/services/catalog.service";
import { catalogService } from "@/services/catalog.service";

const FILTERS: { slug: CatalogCategorySlug; label: string }[] = [
  { slug: "all", label: "Todo" },
  { slug: "new-in", label: "Novedades" },
  { slug: "oversize", label: "Oversize" },
  { slug: "buzo-baggy", label: "Buzos Baggy" },
  { slug: "hoodie", label: "Hoodies" },
  { slug: "manga-larga", label: "Manga Larga" },
  { slug: "basica", label: "Básicas" },
  { slug: "crop", label: "Crop" },
  { slug: "estampada", label: "Estampadas" },
];

type Props = {
  initialCategory?: CatalogCategorySlug;
};

export function CatalogView({ initialCategory = "all" }: Props) {
  const [category, setCategory] = useState<CatalogCategorySlug>(initialCategory);

  const products = useMemo(
    () => catalogService.listByCategory(category),
    [category],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Solo poleras y buzos baggy · Precios en soles · RF-03 / RF-04
        </p>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/search">Búsqueda avanzada</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.slug}
            type="button"
            onClick={() => setCategory(f.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              category === f.slug
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:border-zinc-600",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
