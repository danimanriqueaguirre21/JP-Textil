import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AddToCart } from "@/components/commerce/add-to-cart";
import { formatMoney } from "@/lib/format";
import { getProductBySlug } from "@/lib/data/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Prenda no encontrada — JotaPe Textil" };
  return {
    title: `${product.name} — JotaPe Textil`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const image = product.images[0] ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-8 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30">
          <Image
            src={image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {product.category}
            </p>
            <h1
              data-testid="product-name"
              className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl"
            >
              {product.name}
            </h1>
            <p className="text-lg text-zinc-700 dark:text-zinc-300">
              {formatMoney(product.priceCents, product.currency)}
            </p>
          </div>
          <p className="max-w-lg text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>
          <Suspense fallback={<p className="text-sm text-zinc-500">Cargando…</p>}>
            <AddToCart product={product} />
          </Suspense>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
            Devoluciones gratis dentro de 30 días. Recomendador de talla y
            probador virtual disponibles en{" "}
            <Link
              href="/try-on"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              /try-on
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
