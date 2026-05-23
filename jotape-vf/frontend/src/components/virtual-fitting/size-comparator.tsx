"use client";

import { motion } from "framer-motion";

import { AiRecommendationBanner } from "@/components/try-on/try-on-ui";
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
      <AiRecommendationBanner>
        Tu talla ideal estimada: <strong className="font-semibold">{recommended}</strong>
        <span className="text-emerald-800/80 dark:text-emerald-200/80">
          {" "}
          — Basado en tus medidas y preferencias.
        </span>
      </AiRecommendationBanner>

      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const fit = compareSizeToChest(size, chestCm);
          const isSelected = selected === size;
          const isRecommended = size === recommended;

          return (
            <motion.button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex min-w-[4.5rem] flex-col items-center rounded-2xl border px-4 py-2.5 text-sm transition-all duration-300",
                isSelected
                  ? "scale-105 border-zinc-900 bg-zinc-900 text-white shadow-[0_8px_28px_-8px_rgba(0,0,0,0.35),0_0_24px_-6px_rgba(168,85,247,0.25)] dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200/90 bg-white/80 hover:border-violet-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/60",
                isRecommended &&
                  !isSelected &&
                  "ring-1 ring-emerald-300/50 dark:ring-emerald-700/40",
              )}
            >
              <span className="font-bold tracking-wide">{size}</span>
              <span
                className={cn(
                  "mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider",
                  isSelected ? "text-white/75" : "text-zinc-500",
                )}
              >
                <span
                  className={cn("size-1.5 rounded-full", fitLevelColor(fit.level))}
                />
                {fit.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
