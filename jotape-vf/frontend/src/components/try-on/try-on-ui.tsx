"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const glassCard = cn(
  "rounded-3xl border border-white/70 bg-white/65 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.14)] backdrop-blur-xl",
  "dark:border-zinc-800/70 dark:bg-zinc-950/55",
);

export const tryOnInputClass = cn(
  "w-full rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 text-sm shadow-sm transition",
  "placeholder:text-zinc-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/60",
  "dark:border-zinc-700 dark:bg-zinc-900/80 dark:focus:border-violet-500/50 dark:focus:ring-violet-500/20",
);

type SectionLabelProps = {
  index: string;
  title: string;
  className?: string;
};

export function TryOnSectionLabel({ index, title, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600/80 dark:text-violet-400/90",
        className,
      )}
    >
      {index} · {title}
    </p>
  );
}

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
};

export function GlassPanel({ children, className }: GlassPanelProps) {
  return <div className={cn(glassCard, className)}>{children}</div>;
}

type AiBannerProps = {
  children: ReactNode;
  className?: string;
};

export function AiRecommendationBanner({ children, className }: AiBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/95 via-white/90 to-violet-50/80 px-4 py-3.5",
        "shadow-[0_8px_32px_-12px_rgba(16,185,129,0.2)] dark:border-emerald-900/40 dark:from-emerald-950/50 dark:to-violet-950/30",
        className,
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-400/5 via-emerald-400/10 to-sky-400/5"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <div className="relative flex items-start gap-2.5">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white dark:bg-zinc-50 dark:text-zinc-900">
          <Sparkles className="size-2.5" />
          IA
        </span>
        <p className="text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">
          {children}
        </p>
      </div>
    </motion.div>
  );
}

export function ViewerParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[
        { id: "tl", left: "12%", top: "18%", delay: 0 },
        { id: "tr", left: "78%", top: "22%", delay: 0.8 },
        { id: "br", left: "65%", top: "62%", delay: 1.4 },
        { id: "bl", left: "22%", top: "70%", delay: 2 },
      ].map((p, i) => (
        <motion.span
          key={p.id}
          className="absolute size-1 rounded-full bg-white/50 shadow-[0_0_8px_2px_rgba(255,255,255,0.3)]"
          style={{ left: p.left, top: p.top }}
          animate={{ opacity: [0.2, 0.55, 0.2], y: [0, -8, 0] }}
          transition={{
            duration: 5 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

export function BodySilhouetteVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-sky-50/80 to-violet-50/40 p-4 dark:from-sky-950/30 dark:to-violet-950/20",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-4 rounded-full opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <svg
        viewBox="0 0 120 260"
        className="relative h-full max-h-[220px] w-auto text-sky-400/70 dark:text-sky-500/50"
        aria-hidden
      >
        <ellipse cx="60" cy="26" rx="16" ry="18" fill="currentColor" opacity="0.15" />
        <path
          d="M60 48 L60 125 M38 72 L82 72 M44 125 L44 188 M76 125 L76 188 M44 188 L52 248 M76 188 L68 248"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <text x="8" y="78" className="fill-violet-500/60 text-[8px] font-medium">
          Hombros
        </text>
        <text x="8" y="118" className="fill-violet-500/60 text-[8px] font-medium">
          Pecho
        </text>
        <text x="8" y="152" className="fill-violet-500/60 text-[8px] font-medium">
          Cintura
        </text>
        <text x="8" y="188" className="fill-violet-500/60 text-[8px] font-medium">
          Cadera
        </text>
      </svg>
      <div className="absolute bottom-3 right-3 rounded-xl border border-white/60 bg-white/70 px-2.5 py-1.5 text-[10px] font-medium text-zinc-700 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
        Complexión atlética
      </div>
    </div>
  );
}

export function CameraHudFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <span className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-violet-400/50 rounded-tl-sm" />
      <span className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-violet-400/50 rounded-tr-sm" />
      <span className="absolute bottom-16 left-4 h-8 w-8 border-b-2 border-l-2 border-sky-400/40 rounded-bl-sm" />
      <span className="absolute bottom-16 right-4 h-8 w-8 border-b-2 border-r-2 border-sky-400/40 rounded-br-sm" />
      {children}
    </div>
  );
}

export function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}
