"use client";

import type { BodyMeasurements } from "@/types/virtual-fitting";
import { cn } from "@/lib/utils";

type Props = {
  measurements: BodyMeasurements | null;
};

export function BodyMeasurementsPanel({ measurements }: Props) {
  if (!measurements) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200/80 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30">
        Colócate frente a la cámara para detectar hombros y cadera.
      </p>
    );
  }

  const bars = [
    { label: "Detección", value: measurements.poseQuality },
    { label: "Hombros", value: Math.min(1, measurements.shoulderWidthCm / 50) },
    { label: "Cadera", value: Math.min(1, measurements.hipWidthCm / 55) },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-100/80 bg-white/60 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Hombros" value={`${measurements.shoulderWidthCm} cm`} />
        <Stat label="Cadera" value={`${measurements.hipWidthCm} cm`} />
        <Stat label="Cintura est." value={`${measurements.waistEstimateCm} cm`} />
        <Stat label="Altura est." value={`${measurements.heightEstimateCm} cm`} />
      </div>
      <div className="space-y-2.5">
        {bars.map((b) => (
          <div key={b.label} className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <span>{b.label}</span>
              <span>{Math.round(b.value * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${b.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-100/90 bg-white/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </div>
      <div className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-50">{value}</div>
    </div>
  );
}
