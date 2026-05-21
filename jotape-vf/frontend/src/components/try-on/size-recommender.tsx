"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type Fit,
  type Gender,
  type SizeResult,
  recommendSize,
} from "@/lib/sizing/recommender";

const FIT_OPTIONS: { value: Fit; label: string }[] = [
  { value: "slim", label: "Slim" },
  { value: "regular", label: "Regular" },
  { value: "oversize", label: "Oversize" },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "unisex", label: "Unisex" },
  { value: "male", label: "Hombre" },
  { value: "female", label: "Mujer" },
];

export function SizeRecommender() {
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("65");
  const [fit, setFit] = useState<Fit>("regular");
  const [gender, setGender] = useState<Gender>("unisex");
  const [result, setResult] = useState<SizeResult | null>(null);
  const [computing, setComputing] = useState(false);

  function handleCompute(e: React.FormEvent) {
    e.preventDefault();
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!h || !w || h < 130 || h > 220 || w < 30 || w > 180) {
      alert(
        "Ingresa una altura entre 130–220 cm y un peso entre 30–180 kg.",
      );
      return;
    }
    setComputing(true);
    // Pequeño delay para que se sienta como inferencia
    setTimeout(() => {
      const r = recommendSize({
        heightCm: h,
        weightKg: w,
        fit,
        gender,
      });
      setResult(r);
      setComputing(false);
    }, 450);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <form
        onSubmit={handleCompute}
        className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Sparkles className="h-3 w-3" /> IA de tallas · v0
          </div>
          <h3 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            ¿Qué talla te queda?
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Heurística inicial. Reemplazable por nuestro modelo de ML cuando
            esté en producción (RF-08).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Altura (cm)
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min={130}
              max={220}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Peso (kg)
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min={30}
              max={180}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Calce preferido
          </label>
          <div className="flex flex-wrap gap-2">
            {FIT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setFit(o.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  fit === o.value
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Género (afina la recomendación)
          </label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setGender(o.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  gender === o.value
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={computing}
          className="w-full rounded-full sm:w-auto"
        >
          {computing ? "Calculando…" : "Recomendar mi talla"}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-black sm:p-8"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-zinc-900/5 blur-3xl dark:bg-white/10" />

            <div className="relative space-y-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Tu talla recomendada
              </div>

              <div className="flex items-end gap-4">
                <div className="text-7xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {result.size}
                </div>
                <div className="pb-3 text-sm text-zinc-500">
                  {(result.confidence * 100).toFixed(0)}% de confianza
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                />
              </div>

              <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                {result.rationale.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-2 before:mt-2 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-zinc-400"
                  >
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <p className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
                Resultado heurístico v0. Cuando subas tu medida real al backend
                el sistema usará el modelo ML entrenado y guardará tu perfil
                (RF-07 / RF-08).
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid place-items-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
          >
            Ingresa tus datos y obtén tu talla en segundos.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
