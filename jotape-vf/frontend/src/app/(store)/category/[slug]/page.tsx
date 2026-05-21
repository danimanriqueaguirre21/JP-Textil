import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/commerce/product-grid";
import {
  CATEGORY_LABELS,
  getProductsByCategorySlug,
} from "@/lib/data/products";

type Props = { params: Promise<{ slug: string }> };

const VALID = new Set(Object.keys(CATEGORY_LABELS));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = CATEGORY_LABELS[slug] ?? "Collection";
  return {
    title: `${title} — Atelier`,
    description: `Shop ${title.toLowerCase()} at Atelier.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!VALID.has(slug)) notFound();

  const products = getProductsByCategorySlug(slug);
  const label = CATEGORY_LABELS[slug];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-8 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{label}</span>
      </nav>
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {label}
        </h1>
        <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Curated selection with a premium minimal aesthetic.
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
