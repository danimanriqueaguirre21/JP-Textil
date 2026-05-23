import type { Metadata } from "next";
import Link from "next/link";

import { AudienceCatalog } from "@/features/catalog/audience-catalog";
import { AUDIENCE_PAGE_COPY } from "@/lib/catalog/audience";

const copy = AUDIENCE_PAGE_COPY.tendencias;

export const metadata: Metadata = {
  title: `${copy.title} — JotaPe Textil`,
  description: copy.description,
};

export default function TendenciasPage() {
  return (
    <div className="jp-container py-10 sm:py-14">
      <nav className="mb-8 flex flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">{copy.title}</span>
      </nav>
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {copy.title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>
      <AudienceCatalog audience="tendencias" />
    </div>
  );
}
