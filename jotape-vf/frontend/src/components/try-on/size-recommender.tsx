"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useAvatarCalibration } from "@/hooks/use-avatar-calibration";

import {
  BodySilhouetteVisual,
  GlassPanel,
  fadeUp,
  tryOnInputClass,
} from "@/components/try-on/try-on-ui";
import { Button } from "@/components/ui/button";
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

const pillBtn = (active: boolean) =>
  cn(
    "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
    active
      ? "border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
      : "border-zinc-200/90 bg-white/80 text-zinc-700 hover:border-violet-200 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
  );

export function SizeRecommender() {
  const { calibration, hydrated } = useAvatarCalibration();
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("65");

  useEffect(() => {
    if (!hydrated || !calibration) return;
    setHeightCm(String(calibration.heightCm));
    setWeightKg(String(calibration.weightKg));
  }, [hydrated, calibration]);
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
      <motion.form
        {...fadeUp(0)}
        onSubmit={handleCompute}
        className="space-y-7 p-6 sm:p-8"
      >
        <GlassPanel className="space-y-7 !bg-white/75 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-300">
              <Sparkles className="size-3" />
              IA de tallas
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              ¿Qué talla te queda?
            </h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Ingresa tus datos y obtén una recomendación inteligente en segundos.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="size-recommender-height"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Altura (cm)
              </label>
              <input
                id="size-recommender-height"
                name="heightCm"
                aria-label="Altura en centímetros"
                type="number"
                inputMode="numeric"
                min={130}
                max={220}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                required
                className={tryOnInputClass}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="size-recommender-weight"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Peso (kg)
              </label>
              <input
                id="size-recommender-weight"
                name="weightKg"
                aria-label="Peso en kilogramos"
                type="number"
                inputMode="numeric"
                min={30}
                max={180}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                className={tryOnInputClass}
              />
            </div>
          </div>

          <fieldset className="space-y-3 border-0 p-0">
            <legend className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Calce preferido
            </legend>
            <div className="flex flex-wrap gap-2">
              {FIT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={fit === o.value}
                  onClick={() => setFit(o.value)}
                  className={pillBtn(fit === o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3 border-0 p-0">
            <legend className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Género
            </legend>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={gender === o.value}
                  onClick={() => setGender(o.value)}
                  className={pillBtn(gender === o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <Button
            type="submit"
            disabled={computing}
            className="w-full rounded-full bg-zinc-900 text-sm font-semibold shadow-lg transition hover:scale-[1.02] dark:bg-zinc-50 dark:text-zinc-900 sm:w-auto"
          >
            <Sparkles className="mr-2 size-4" />
            {computing ? "Calculando…" : "Recomendar mi talla"}
          </Button>
        </GlassPanel>
      </motion.form>

      <motion.div {...fadeUp(0.08)} className="min-h-[320px]">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="relative h-full min-h-[320px] overflow-hidden rounded-3xl border border-violet-200/40 bg-gradient-to-br from-white via-violet-50/30 to-sky-50/40 p-6 shadow-[0_20px_60px_-28px_rgba(168,85,247,0.2)] dark:border-violet-900/30 dark:from-zinc-950 dark:to-violet-950/20 sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl"
                aria-hidden
              />
              <div className="grid h-full gap-6 lg:grid-cols-[1fr_0.85fr]">
                <div className="relative space-y-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600/80 dark:text-violet-400">
                    Recomendación IA
                  </p>
                  <div className="flex items-end gap-4">
                    <span className="text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {result.size}
                    </span>
                    <span className="pb-3 text-sm text-zinc-500">
                      {(result.confidence * 100).toFixed(0)}% confianza
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence * 100}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500"
                    />
                  </div>
                  <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {result.rationale.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-violet-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <BodySilhouetteVisual className="min-h-[200px]" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid h-full min-h-[320px] place-items-center rounded-3xl border border-dashed border-zinc-200/90 bg-zinc-50/50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/20"
            >
              <div className="space-y-4">
                <BodySilhouetteVisual className="mx-auto h-48 w-40 opacity-60" />
                <p className="text-sm text-zinc-500">
                  Ingresa tus datos y obtén tu talla en segundos.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
