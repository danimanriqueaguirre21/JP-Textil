"use client";

import { motion } from "framer-motion";
import { ArrowRight, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { BodyScanCapturePanel } from "@/components/body-scan/body-scan-capture-panel";
import { BodyScanInstructions } from "@/components/body-scan/body-scan-instructions";
import { BodyScanReview } from "@/components/body-scan/body-scan-review";
import { BodyScanStepProgress } from "@/components/body-scan/body-scan-step-progress";
import {
  AiRecommendationBanner,
  GlassPanel,
  TryOnSectionLabel,
  fadeUp,
} from "@/components/try-on/try-on-ui";
import { Button } from "@/components/ui/button";
import { useBodyScanSession } from "@/hooks/use-body-scan-session";
import { useBodyProfile } from "@/hooks/use-body-profile";
import { BodyScanAnalyzingOverlay } from "@/components/body-scan/body-scan-analyzing-overlay";
import {
  analyzeBodyScanCapture,
  disposeBodyScanPoseModel,
} from "@/lib/body-scan/mediapipe-pose-bridge";
import { BodyProfileForm } from "@/features/body-scan/body-profile-form";
import { cn } from "@/lib/utils";
import type {
  BodyScanImageCapture,
  BodyScanWizardStep,
} from "@/types/body-scan";

type Props = {
  /** `lab` = probador público; `account` = área de cuenta. */
  variant?: "lab" | "account";
};

export function BodyScanFlow({ variant = "account" }: Props) {
  const { session, hydrated, setCapture, clearCapture, resetSession } =
    useBodyScanSession();
  const { profile } = useBodyProfile();
  const [step, setStep] = useState<BodyScanWizardStep>("intro");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const resumedRef = useRef(false);

  useEffect(() => () => disposeBodyScanPoseModel(), []);

  useEffect(() => {
    if (!hydrated || !session || resumedRef.current) return;
    resumedRef.current = true;
    if (
      session.front?.pose?.status === "ready" &&
      session.side?.pose?.status === "ready"
    ) {
      setStep("review");
    } else if (session.front?.pose?.status === "ready") {
      setStep("side");
    } else if (session.front) {
      setStep("front");
    }
  }, [hydrated, session]);

  const frontDone = Boolean(session?.front);
  const sideDone = Boolean(session?.side);

  const runPoseAnalysis = useCallback(
    async (capture: BodyScanImageCapture) => {
      setAnalyzing(true);
      try {
        const pose = await analyzeBodyScanCapture(
          capture,
          capture.view,
          profile.heightCm,
        );
        return { ...capture, pose };
      } finally {
        setAnalyzing(false);
      }
    },
    [profile.heightCm],
  );

  const handleFrontConfirm = useCallback(
    async (capture: BodyScanImageCapture) => {
      setAnalysisError(null);
      const withPose = await runPoseAnalysis(capture);
      setCapture("front", withPose);
      if (withPose.pose?.status === "ready") {
        setAnalysisError(null);
        setStep("side");
      } else {
        setAnalysisError(
          withPose.pose?.errorMessage ??
            "No se pudo validar la pose. Intenta con otra foto.",
        );
        setStep("front");
      }
    },
    [runPoseAnalysis, setCapture],
  );

  const handleSideConfirm = useCallback(
    async (capture: BodyScanImageCapture) => {
      setAnalysisError(null);
      const withPose = await runPoseAnalysis(capture);
      setCapture("side", withPose);
      if (withPose.pose?.status === "ready") {
        setAnalysisError(null);
        setStep("review");
      } else {
        setAnalysisError(
          withPose.pose?.errorMessage ??
            "No se pudo validar la pose lateral.",
        );
        setStep("side");
      }
    },
    [runPoseAnalysis, setCapture],
  );

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p className="text-sm text-zinc-500">Preparando escáner…</p>
      </div>
    );
  }

  const isLab = variant === "lab";

  return (
    <div className={cn("space-y-8", isLab && "jp-animate-fade-up")}>
      {isLab && (
        <header className="mx-auto max-w-2xl space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-300">
            <ScanLine className="size-3.5" />
            Escaneo corporal · Fases 1–3
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Captura y análisis de pose
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pose + segmentación corporal con tu altura real. El avatar se calibra
            por tipo corporal (delgado → robusto).
          </p>
        </header>
      )}

      {!isLab && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Escaneo corporal
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Captura, MediaPipe y calibración del avatar 3D.
          </p>
        </div>
      )}

      <BodyScanStepProgress
        current={step}
        frontDone={frontDone}
        sideDone={sideDone}
      />

      {step === "intro" && (
        <motion.section {...fadeUp(0)} className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <TryOnSectionLabel index="00" title="Antes de empezar" />
            <AiRecommendationBanner>
              Usa ropa ajustada o interior técnico. Evita abrigos que oculten la
              silueta. Las fotos no salen del navegador hasta que conectemos el
              backend.
            </AiRecommendationBanner>
            <BodyScanInstructions />
            <GlassPanel className="p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Calibración (obligatorio)
              </p>
              <BodyProfileForm />
            </GlassPanel>
            <Button
              type="button"
              size="lg"
              className="w-full rounded-full sm:w-auto"
              disabled={!profile.heightCm || profile.heightCm < 130}
              onClick={() => setStep(frontDone && !sideDone ? "side" : "front")}
            >
              Comenzar captura
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <GlassPanel className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600/90 dark:text-violet-400">
              Flujo
            </p>
            <ol className="mt-4 space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                  0
                </span>
                Altura real (cm) — calibración píxeles
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                  1
                </span>
                Foto frontal + segmentación corporal
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                  2
                </span>
                Foto lateral (profundidad torso)
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                  3
                </span>
                Tipo corporal, medidas y avatar calibrado
              </li>
            </ol>
          </GlassPanel>
        </motion.section>
      )}

      {analyzing && <BodyScanAnalyzingOverlay />}

      {step === "front" && (
        <motion.section {...fadeUp(0)} className="grid gap-8 xl:grid-cols-[1fr,min(360px,100%)]">
          <BodyScanCapturePanel
            view="front"
            existing={session.front}
            analysisError={step === "front" ? analysisError : null}
            onConfirm={handleFrontConfirm}
            onClearError={() => setAnalysisError(null)}
            onCancel={() => {
              setAnalysisError(null);
              setStep("intro");
            }}
          />
          <div className="hidden xl:block">
            <TryOnSectionLabel index="01" title="Consejos" className="mb-3" />
            <BodyScanInstructions compact />
          </div>
        </motion.section>
      )}

      {step === "side" && (
        <motion.section {...fadeUp(0)} className="grid gap-8 xl:grid-cols-[1fr,min(360px,100%)]">
          <BodyScanCapturePanel
            view="side"
            existing={session.side}
            analysisError={step === "side" ? analysisError : null}
            onConfirm={handleSideConfirm}
            onClearError={() => setAnalysisError(null)}
            onCancel={() => {
              setAnalysisError(null);
              setStep(frontDone ? "front" : "intro");
            }}
          />
          <div className="hidden xl:block">
            <TryOnSectionLabel index="02" title="Consejos" className="mb-3" />
            <BodyScanInstructions compact />
          </div>
        </motion.section>
      )}

      {step === "review" && session.front && session.side && (
        <motion.section {...fadeUp(0)}>
          <BodyScanReview
            session={session}
            onRetakeFront={() => {
              clearCapture("front");
              setStep("front");
            }}
            onRetakeSide={() => {
              clearCapture("side");
              setStep("side");
            }}
            onNewSession={() => {
              resetSession();
              setStep("intro");
            }}
          />
        </motion.section>
      )}

      {step === "review" && (!session.front || !session.side) && (
        <GlassPanel className="p-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Faltan capturas.{" "}
          <button
            type="button"
            className="font-medium text-violet-700 underline dark:text-violet-300"
            onClick={() => setStep(!session.front ? "front" : "side")}
          >
            Continuar escaneo
          </button>
        </GlassPanel>
      )}
    </div>
  );
}
