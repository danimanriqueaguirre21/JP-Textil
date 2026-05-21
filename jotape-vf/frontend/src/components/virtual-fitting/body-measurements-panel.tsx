"use client";

import type { BodyMeasurements } from "@/types/virtual-fitting";

type Props = {
  measurements: BodyMeasurements | null;
};

export function BodyMeasurementsPanel({ measurements }: Props) {
  if (!measurements) {
    return (
      <p className="text-sm text-zinc-500">
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Hombros" value={`${measurements.shoulderWidthCm} cm`} />
        <Stat label="Cadera" value={`${measurements.hipWidthCm} cm`} />
        <Stat label="Cintura est." value={`${measurements.waistEstimateCm} cm`} />
        <Stat label="Altura est." value={`${measurements.heightEstimateCm} cm`} />
      </div>
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label} className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{b.label}</span>
              <span>{Math.round(b.value * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
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
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="font-medium text-zinc-900 dark:text-zinc-50">{value}</div>
    </div>
  );
}
