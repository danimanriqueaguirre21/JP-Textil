"use client";

import type { NormalizedAvatarMeasurements } from "@/lib/body-scan/normalize-avatar-measurements";

type Props = {
  human: NormalizedAvatarMeasurements | null;
};

const ROWS: {
  key: keyof Pick<
    NormalizedAvatarMeasurements,
    | "heightCm"
    | "chestCm"
    | "waistCm"
    | "hipCm"
    | "shoulderCm"
    | "armCm"
    | "legCm"
  >;
  label: string;
}[] = [
  { key: "heightCm", label: "Altura" },
  { key: "chestCm", label: "Pecho" },
  { key: "waistCm", label: "Cintura" },
  { key: "hipCm", label: "Cadera" },
  { key: "shoulderCm", label: "Hombros" },
  { key: "armCm", label: "Brazo" },
  { key: "legCm", label: "Pierna" },
];

/** Medidas corporales finales en cm (misma fuente que el avatar calibrado). */
export function HumanMeasurementsPanel({ human }: Props) {
  if (!human) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200/80 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30">
        Completa el escaneo frontal y lateral para estimar tus medidas.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">
        Medidas corporales (estimadas)
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ROWS.map(({ key, label }) => (
          <div
            key={key}
            className="rounded-xl border border-white/80 bg-white/90 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/60"
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              {label}
            </div>
            <div className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {human[key]}
              <span className="ml-0.5 text-xs font-normal text-zinc-500">cm</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
        Estas son las medidas usadas en el probador 3D. Se validan a partir del
        escaneo y tu altura de perfil.
      </p>
    </div>
  );
}
