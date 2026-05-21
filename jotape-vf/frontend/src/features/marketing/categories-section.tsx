import Image from "next/image";
import Link from "next/link";

import { unsplashPhoto } from "@/lib/image-urls";

const CATEGORIES = [
  {
    slug: "oversize",
    title: "Oversize",
    subtitle: "Hombros caídos · S/ 135",
    image: unsplashPhoto("photo-1521572163474-6864f9cf17ab", 1600),
  },
  {
    slug: "buzo-baggy",
    title: "Buzos Baggy",
    subtitle: "French terry pesado · S/ 125–135",
    image: unsplashPhoto("photo-1517438476312-10d79c077509", 1600),
  },
  {
    slug: "hoodie",
    title: "Hoodies",
    subtitle: "Capucha y canguro · S/ 80",
    image: unsplashPhoto("photo-1556821840-3a63f95609a7", 1600),
  },
  {
    slug: "basica",
    title: "Básicas",
    subtitle: "Algodón peinado · S/ 35",
    image: unsplashPhoto("photo-1620799140408-edc6dcb6d633", 1600),
  },
];

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-end justify-between gap-6">
        <div className="space-y-2 jp-animate-fade-up">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Comprar por estilo
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Poleras y buzos baggy — curaduría minimalista, precios en soles.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="jp-hover-lift jp-animate-fade-up group relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
          >
            <div className="relative aspect-[5/4]">
              <Image
                src={c.image}
                alt={c.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="text-lg font-semibold text-white">{c.title}</div>
              <div className="text-sm text-white/80">{c.subtitle}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
