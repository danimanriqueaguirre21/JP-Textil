import {
  CHEST_TABLE,
  type Size,
} from "@/lib/sizing/recommender";
import type { FitLevel, SizeFitResult } from "@/types/virtual-fitting";

const FIT_LABELS: Record<FitLevel, string> = {
  perfect: "Ajustado",
  regular: "Regular",
  loose: "Holgado",
  tight: "Apretado",
};

/** Multiplicador visual de overlay por talla (M = 1). */
export const SIZE_OVERLAY_MULTIPLIER: Record<Size, number> = {
  XS: 0.88,
  S: 0.94,
  M: 1,
  L: 1.06,
  XL: 1.12,
};

export function compareSizeToChest(
  size: Size,
  chestCm: number,
): SizeFitResult {
  const row = CHEST_TABLE.find((r) => r.size === size);
  if (!row) {
    return {
      size,
      level: "regular",
      diffPercent: 0,
      label: FIT_LABELS.regular,
    };
  }

  const garmentMid = (row.minChest + row.maxChest) / 2;
  const diffPercent = ((garmentMid - chestCm) / chestCm) * 100;

  let level: FitLevel;
  const abs = Math.abs(diffPercent);
  if (abs <= 5) level = "perfect";
  else if (diffPercent > 15) level = "loose";
  else if (diffPercent < -15) level = "tight";
  else level = "regular";

  return {
    size,
    level,
    diffPercent,
    label: FIT_LABELS[level],
  };
}

export function rankSizesForChest(chestCm: number): SizeFitResult[] {
  const sizes = CHEST_TABLE.map((r) => r.size);
  return sizes
    .map((size) => compareSizeToChest(size, chestCm))
    .sort((a, b) => Math.abs(a.diffPercent) - Math.abs(b.diffPercent));
}

export function fitLevelColor(level: FitLevel): string {
  switch (level) {
    case "perfect":
      return "bg-emerald-500";
    case "regular":
      return "bg-amber-400";
    case "loose":
    case "tight":
      return "bg-red-500";
  }
}
