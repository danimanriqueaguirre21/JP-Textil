"use client";

import { Loader2 } from "lucide-react";

import { GlassPanel } from "@/components/try-on/try-on-ui";

type Props = {
  message?: string;
};

export function BodyScanAnalyzingOverlay({
  message = "Analizando pose con MediaPipe…",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm">
      <GlassPanel className="flex max-w-md flex-col items-center gap-4 px-8 py-10 text-center">
        <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {message}
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          La primera vez puede tardar 10–30 s mientras se descarga el modelo de
          MediaPipe. No cierres esta pestaña.
        </p>
      </GlassPanel>
    </div>
  );
}
