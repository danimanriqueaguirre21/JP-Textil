import type { Metadata } from "next";

import { BodyScanFlow } from "@/components/body-scan/body-scan-flow";

export const metadata: Metadata = {
  title: "Escaneo corporal",
  description:
    "Captura guiada de fotos frontal y lateral para el probador virtual JotaPe.",
};

export default function TryOnBodyScanPage() {
  return (
    <main className="relative overflow-hidden bg-white dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[min(100%,48rem)] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(196,181,253,0.14) 0%, rgba(147,197,253,0.07) 50%, transparent 72%)",
        }}
        aria-hidden
      />
      <div className="jp-container relative px-4 py-12 sm:px-6 sm:py-16">
        <BodyScanFlow variant="lab" />
      </div>
    </main>
  );
}
