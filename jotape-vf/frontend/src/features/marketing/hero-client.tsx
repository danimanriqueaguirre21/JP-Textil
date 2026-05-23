"use client";

import Link from "next/link";
import {
  ArrowRight,
  Box,
  RefreshCw,
  RotateCcw,
  ScanFace,
  Shield,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroVisualCollage } from "@/features/marketing/hero-visual-collage";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Recomendación IA",
    description: "Talla sugerida en segundos",
  },
  {
    icon: ScanFace,
    title: "Avatar 3D real",
    description: "Vista frontal interactiva",
  },
  {
    icon: Box,
    title: "Prenda en contexto",
    description: "Visualiza el calce antes de comprar",
  },
  {
    icon: RotateCcw,
    title: "Menos devoluciones",
    description: "Compra con más confianza",
  },
] as const;

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: "Compra segura",
    description: "Protegemos tu información",
  },
  {
    icon: Truck,
    title: "Envíos a todo el Perú",
    description: "Rápidos y confiables",
  },
  {
    icon: RefreshCw,
    title: "Cambios fáciles",
    description: "Sin complicaciones",
  },
] as const;

export function Hero() {
  return (
    <section
      data-testid="home-hero"
      className="relative overflow-visible bg-white dark:bg-zinc-950"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-bl from-fuchsia-100/50 via-violet-100/30 to-transparent blur-3xl dark:from-fuchsia-950/20 dark:via-violet-950/15"
        aria-hidden
      />

      <div className="jp-container relative pt-12 pb-6 sm:pt-16 sm:pb-7 lg:pt-16 lg:pb-8 xl:pt-20 xl:pb-9">
        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-10 xl:gap-14">
          <div className="flex flex-col justify-center space-y-8 lg:space-y-10">
            <div className="space-y-5 sm:space-y-6">
              <p
                className={cn(
                  "jp-animate-fade-up inline-flex w-fit items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/90 px-3.5 py-1.5",
                  "text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700",
                  "dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300",
                )}
              >
                <Sparkles className="size-3.5 shrink-0 text-violet-500" />
                AI POWERED FITTING
              </p>
              <h1 className="jp-animate-fade-up max-w-2xl text-4xl font-extrabold leading-[0.95] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl xl:text-[4.25rem] xl:leading-[0.92]">
                <span className="block">Encuentra tu</span>
                <span className="block">talla perfecta</span>
              </h1>
              <p className="jp-animate-fade-up jp-delay-1 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg sm:leading-8">
                Probador virtual con IA que recomienda tu talla ideal. Streetwear
                premium hecho en Perú para tu estilo único.
              </p>
            </div>

            <div className="jp-animate-fade-up jp-delay-2 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full bg-zinc-900 px-7 text-sm font-semibold text-white shadow-lg shadow-zinc-900/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-50 dark:text-zinc-900 dark:shadow-zinc-50/10 dark:hover:bg-zinc-200"
              >
                <Link href="/try-on" className="inline-flex items-center gap-2">
                  <Sparkles className="size-4 shrink-0 opacity-90" />
                  Probar IA
                  <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-zinc-200 bg-white px-7 text-sm font-semibold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-transparent dark:text-zinc-50 dark:hover:border-zinc-50"
              >
                <Link href="/catalog">Explorar catálogo</Link>
              </Button>
            </div>

            <ul className="jp-animate-fade-up jp-delay-3 grid gap-3 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className={cn(
                    "group flex gap-3 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md transition duration-300",
                    "hover:-translate-y-1 hover:border-zinc-200/80 hover:bg-white/75 hover:shadow-[0_16px_40px_-14px_rgba(0,0,0,0.18)]",
                    "dark:border-zinc-700/50 dark:bg-zinc-900/45 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/65",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm transition group-hover:scale-105 dark:bg-zinc-50 dark:text-zinc-900">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex w-full justify-center overflow-visible pt-2 sm:pt-4 lg:justify-end lg:pt-0">
            <HeroVisualCollage />
          </div>
        </div>

        <div
          className={cn(
            "jp-animate-fade-up jp-delay-3 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:pt-7",
            "mt-8 sm:mt-9 lg:mt-10",
          )}
          data-testid="home-hero-trust"
        >
          <ul className="grid gap-5 sm:grid-cols-3 sm:gap-4">
            {TRUST_ITEMS.map(({ icon: Icon, title, description }, index) => (
              <li
                key={title}
                className={cn(
                  "flex items-start gap-3 sm:items-center",
                  index > 0 &&
                    "sm:border-l sm:border-zinc-100 sm:pl-6 dark:sm:border-zinc-800",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
