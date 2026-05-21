import type { Metadata } from "next";
import Link from "next/link";

import { CatalogView } from "@/features/catalog";

export const metadata: Metadata = {
  title: "Catálogo — JotaPe Textil",
  description:
    "Catálogo de prendas JotaPe Textil — filtros y búsqueda listos para IA.",
};

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="jp-animate-fade-up mb-8 flex flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">Catálogo</span>
      </nav>
      <div className="jp-animate-fade-up jp-delay-1 mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Catálogo
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Explora todas las piezas. Esta vista usa datos mock locales; sustituye
          por `catalogService` + FastAPI cuando el backend esté listo.
        </p>
      </div>
      <CatalogView />
    </div>
  );
}
