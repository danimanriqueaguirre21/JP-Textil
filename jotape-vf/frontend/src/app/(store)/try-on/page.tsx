import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine } from "lucide-react";

import { SizeRecommender } from "@/components/try-on/size-recommender";
import { GlassPanel, TryOnSectionLabel } from "@/components/try-on/try-on-ui";
import { Button } from "@/components/ui/button";
import { VirtualFitting3DPanel } from "@/components/virtual-fitting/virtual-fitting-3d-panel";
import { VirtualFittingRoomLazy } from "@/components/virtual-fitting/virtual-fitting-room-lazy";

export const metadata: Metadata = {
  title: "Probador IA",
  description:
    "Recomendador de tallas y probador virtual de poleras y buzos baggy de JotaPe Textil.",
};

export default function TryOnPage() {
  return (
    <main className="relative overflow-hidden bg-white dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[min(100%,56rem)] -translate-x-1/2 rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(196,181,253,0.12) 0%, rgba(147,197,253,0.06) 50%, transparent 72%)",
        }}
        aria-hidden
      />

      <div className="jp-container relative space-y-16 px-4 py-12 sm:space-y-20 sm:px-6 sm:py-16 lg:space-y-24">
        <header className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-300">
            Try-On Lab · Beta
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-[2.75rem]">
            Probador virtual JotaPe
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Avatar 3D con prenda interactiva, recomendador de tallas con IA y
            probador con cámara MediaPipe.
          </p>
        </header>

        <section id="avatar" className="space-y-5 scroll-mt-24">
          <TryOnSectionLabel index="01" title="Avatar 3D + prenda" />
          <VirtualFitting3DPanel />
        </section>

        <section className="space-y-5">
          <TryOnSectionLabel index="02" title="Tu talla" />
          <SizeRecommender />
        </section>

        <section className="space-y-5">
          <TryOnSectionLabel index="03" title="Cámara y calce 2D" />
          <VirtualFittingRoomLazy />
        </section>

        <section className="space-y-5">
          <TryOnSectionLabel index="04" title="Escaneo corporal" />
          <GlassPanel className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="max-w-xl space-y-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Captura guiada frontal y lateral
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Captura frontal y lateral con análisis MediaPipe Pose y medidas
                estimadas. Avatar 3D en fase 3.
              </p>
            </div>
            <Button asChild className="shrink-0 rounded-full">
              <Link href="/try-on/body-scan">
                <ScanLine className="size-4" />
                Abrir escáner
              </Link>
            </Button>
          </GlassPanel>
        </section>
      </div>
    </main>
  );
}
