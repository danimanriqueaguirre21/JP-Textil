"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

import { BodyScanApplyPanel } from "@/components/body-scan/body-scan-apply-panel";
import { BodyScanMeasurementsSummary } from "@/components/body-scan/body-scan-measurements-summary";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import { BodyScanPoseThumb } from "@/components/body-scan/body-scan-pose-thumb";
import { BodyProfileForm } from "@/features/body-scan/body-profile-form";
import { GlassPanel, TryOnSectionLabel } from "@/components/try-on/try-on-ui";
import { Button } from "@/components/ui/button";
import type { BodyScanSession } from "@/types/body-scan";

type Props = {
  session: BodyScanSession;
  onRetakeFront: () => void;
  onRetakeSide: () => void;
  onNewSession: () => void;
};

export function BodyScanReview({
  session,
  onRetakeFront,
  onRetakeSide,
  onNewSession,
}: Props) {
  const bothReady =
    session.front?.pose?.status === "ready" &&
    session.side?.pose?.status === "ready";

  const diagnostic = isBodyScanDiagnosticMode();

  return (
    <div className="space-y-6">
      {diagnostic && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100">
          <strong>Modo diagnóstico activo.</strong> Clamps y suavizado desactivados.
          Revisa consola (F12) y el panel de depuración abajo. Las líneas de color en
          las fotos muestran anchos/profundidades detectados en cm.
        </div>
      )}
      <div>
        <TryOnSectionLabel index="04" title="Revisión" />
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Capturas y análisis de pose
        </h2>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Imágenes en <code className="text-xs">sessionStorage</code>. Puedes fusionar
          medidas, aplicarlas al avatar 3D y guardarlas en tu cuenta (si hay sesión).
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <BodyScanPoseThumb
          label="Vista frontal"
          capture={session.front!}
          onRetake={onRetakeFront}
        />
        <BodyScanPoseThumb
          label="Vista lateral"
          capture={session.side!}
          onRetake={onRetakeSide}
        />
      </div>

      <GlassPanel className="p-5 sm:p-6">
        <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Tu altura y peso
        </p>
        <BodyProfileForm />
      </GlassPanel>

      {bothReady ? (
        <>
          <BodyScanMeasurementsSummary session={session} />
          <BodyScanApplyPanel session={session} />
        </>
      ) : (
        <GlassPanel className="border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Una o ambas capturas no pasaron la validación de pose. Repite las vistas
            marcadas con «Revisar pose» siguiendo las instrucciones de encuadre.
          </p>
        </GlassPanel>
      )}

      <GlassPanel className="flex gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <Cpu className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Escaneo corporal · Fases 1–3
          </p>
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            Captura, MediaPipe Pose, fusión de medidas y calibración del avatar 3D.
            Las medidas se pueden persistir en PostgreSQL (`medidas_usuario`).
          </p>
          <p className="text-[11px] text-zinc-500">
            Sesión: <span className="font-mono">{session.id.slice(0, 8)}</span>
          </p>
        </div>
      </GlassPanel>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3"
      >
        <Button
          type="button"
          className="rounded-full"
          onClick={onNewSession}
          variant="outline"
        >
          Nueva sesión de escaneo
        </Button>
      </motion.div>
    </div>
  );
}
