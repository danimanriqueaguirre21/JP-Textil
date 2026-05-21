"use client";

import { SIZES, type Size } from "@/lib/sizing/recommender";
import {
  compareSizeToChest,
  fitLevelColor,
  rankSizesForChest,
} from "@/lib/virtual-fitting/size-fit";
import { cn } from "@/lib/utils";

type Props = {
  chestCm: number;
  selected: Size;
  onSelect: (size: Size) => void;
};

export function SizeComparator({ chestCm, selected, onSelect }: Props) {
  const ranked = rankSizesForChest(chestCm);
  const recommended = ranked[0]?.size ?? "M";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
        Tu talla ideal estimada: <strong>{recommended}</strong>
      </div>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const fit = compareSizeToChest(size, chestCm);
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              className={cn(
                "flex flex-col items-center rounded-2xl border px-4 py-2 text-sm transition-colors",
                selected === size
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950",
              )}
            >
              <span className="font-semibold">{size}</span>
              <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                <span
                  className={cn("h-2 w-2 rounded-full", fitLevelColor(fit.level))}
                />
                {fit.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
