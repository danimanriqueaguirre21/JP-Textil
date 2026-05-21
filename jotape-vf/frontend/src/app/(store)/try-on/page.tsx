import type { Metadata } from "next";

import { SizeRecommender } from "@/components/try-on/size-recommender";
import { VirtualFitting3DPanel } from "@/components/virtual-fitting/virtual-fitting-3d-panel";
import { VirtualFittingRoom } from "@/components/virtual-fitting/virtual-fitting-room";

export const metadata: Metadata = {
  title: "Probador IA",
  description:
    "Recomendador de tallas y probador virtual de poleras y buzos baggy de JotaPe Textil.",
};

export default function TryOnPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
          Try-On Lab · Beta
        </div>
        <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Probador virtual JotaPe
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Avatar 3D genérico con prenda interactiva, recomendador de tallas y
          probador con cámara (MediaPipe).
        </p>
      </header>

      <section className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          01 · Avatar 3D + prenda
        </p>
        <VirtualFitting3DPanel />
      </section>

      <section className="space-y-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          02 · Tu talla
        </p>
        <SizeRecommender />
      </section>

      <section className="space-y-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          03 · Cámara y calce 2D
        </p>
        <VirtualFittingRoom />
      </section>
    </main>
  );
}
