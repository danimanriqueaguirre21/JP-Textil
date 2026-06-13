"use client";

import type { PoseTechnicalReadout } from "@/lib/body-scan/resolve-display-measurements";

type Props = {
  technical: PoseTechnicalReadout | null;
};

function relPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${Math.round(value * 100)} %`;
}

function ViewBlock({
  title,
  view,
}: {
  title: string;
  view: NonNullable<PoseTechnicalReadout["front"]>;
}) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
        <li>Ancho hombros (relativo): {relPercent(view.shoulderRel)}</li>
        <li>
          {view.view === "side" ? "Ancho en plano lateral" : "Ancho cadera (relativo)"}:{" "}
          {relPercent(view.hipRel)}
        </li>
        <li>Cintura (relativo): {relPercent(view.waistRel)}</li>
        {view.depthRel !== undefined && (
          <li>Profundidad torso (relativa): {relPercent(view.depthRel)}</li>
        )}
      </ul>
    </div>
  );
}

/**
 * Datos internos de MediaPipe — no son medidas finales en cm.
 */
export function PoseTechnicalPanel({ technical }: Props) {
  if (!technical) return null;

  return (
    <details className="rounded-2xl border border-zinc-200/70 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/30">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Datos de detección IA (técnicos)
      </summary>
      <div className="space-y-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Porcentajes respecto a un cuerpo de referencia (~170 cm). En la vista
          lateral, los anchos no son circunferencias reales; por eso no se
          muestran como medidas finales.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Confianza de pose:</span>
          <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {technical.poseQualityPercent} %
          </span>
        </div>
        {technical.front && (
          <ViewBlock title="Vista frontal" view={technical.front} />
        )}
        {technical.side && <ViewBlock title="Vista lateral" view={technical.side} />}
      </div>
    </details>
  );
}
