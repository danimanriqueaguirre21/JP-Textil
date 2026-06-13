"use client";

import { motion } from "framer-motion";

import { BODY_SCAN_INSTRUCTIONS } from "@/lib/body-scan/scan-instructions";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  className?: string;
};

export function BodyScanInstructions({ compact, className }: Props) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {BODY_SCAN_INSTRUCTIONS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className={cn(
              "flex gap-3 rounded-2xl border border-white/60 bg-white/50 px-3 py-2.5 backdrop-blur-sm",
              "dark:border-zinc-800/80 dark:bg-zinc-900/50",
              compact && "py-2",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.title}
              </p>
              {!compact && (
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
