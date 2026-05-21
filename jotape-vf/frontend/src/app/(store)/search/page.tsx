import type { Metadata } from "next";
import Link from "next/link";

import { ProductGrid } from "@/components/commerce/product-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Buscar — JotaPe Textil",
  description: "Encuentra poleras y buzos baggy en JotaPe Textil.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = searchProducts(q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Buscar
      </h1>
      <form action="/search" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar prendas…"
          aria-label="Término de búsqueda"
          className="sm:max-w-md"
        />
        <Button type="submit" className="rounded-full sm:w-auto">
          Buscar
        </Button>
      </form>
      {q ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {results.length} resultado{results.length === 1 ? "" : "s"} para “{q}”
        </p>
      ) : (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Ingresa un término para buscar en el catálogo, o{" "}
          <Link
            href="/category/new-in"
            className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            mira las novedades
          </Link>
          .
        </p>
      )}
      <div className="mt-10">
        <ProductGrid products={results} />
      </div>
    </div>
  );
}
