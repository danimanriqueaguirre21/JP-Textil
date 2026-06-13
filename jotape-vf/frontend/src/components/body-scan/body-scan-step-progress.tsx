"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BodyScanWizardStep } from "@/types/body-scan";

const STEPS: { id: BodyScanWizardStep; label: string }[] = [
  { id: "intro", label: "Guía" },
  { id: "front", label: "Frontal" },
  { id: "side", label: "Lateral" },
  { id: "review", label: "Revisión" },
];

type Props = {
  current: BodyScanWizardStep;
  frontDone: boolean;
  sideDone: boolean;
};

function stepIndex(step: BodyScanWizardStep): number {
  return STEPS.findIndex((s) => s.id === step);
}

export function BodyScanStepProgress({
  current,
  frontDone,
  sideDone,
}: Props) {
  const currentIdx = stepIndex(current);

  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
      {STEPS.map((step, idx) => {
        const done =
          step.id === "front"
            ? frontDone
            : step.id === "side"
              ? sideDone
              : idx < currentIdx;
        const active = step.id === current;
        const upcoming = idx > currentIdx && !done;

        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active &&
                  "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200",
                done &&
                  !active &&
                  "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
                upcoming &&
                  "border-zinc-200 bg-white/60 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500",
                !active && !done && !upcoming && "border-zinc-200 text-zinc-600",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                  active && "bg-violet-600 text-white",
                  done && !active && "bg-emerald-600 text-white",
                  upcoming && "bg-zinc-200 text-zinc-600 dark:bg-zinc-800",
                )}
              >
                {done && !active ? (
                  <Check className="size-3" aria-hidden />
                ) : (
                  idx + 1
                )}
              </span>
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <span
                className="hidden h-px w-4 bg-zinc-200 sm:block dark:bg-zinc-800"
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
