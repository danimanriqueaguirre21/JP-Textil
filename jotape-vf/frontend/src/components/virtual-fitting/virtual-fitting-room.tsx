"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Download,
  ImageIcon,
  RotateCcw,
  Upload,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CameraHudFrame,
  GlassPanel,
  fadeUp,
  tryOnInputClass,
} from "@/components/try-on/try-on-ui";
import { SilhouetteGuide } from "@/components/virtual-fitting/silhouette-guide";
import { BodyMeasurementsPanel } from "@/components/virtual-fitting/body-measurements-panel";
import { SizeComparator } from "@/components/virtual-fitting/size-comparator";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { useMediaPipePose } from "@/hooks/use-mediapipe-pose";
import {
  calculateBodyMeasurements,
  isPoseValid,
} from "@/lib/virtual-fitting/measurement-calculator";
import {
  computeGarmentDrawParams,
  drawGarmentOnCanvas,
  drawPoseSkeleton,
} from "@/lib/virtual-fitting/garment-renderer";
import { SIZE_OVERLAY_MULTIPLIER } from "@/lib/virtual-fitting/size-fit";
import { catalogService } from "@/services/catalog.service";
import type { Size } from "@/lib/sizing/recommender";
import type {
  BodyMeasurements,
  VirtualFittingMode,
} from "@/types/virtual-fitting";
import { cn } from "@/lib/utils";

const FITTABLE_SLUGS = [
  "polera-oversize-negra",
  "polera-oversize-blanca",
  "polera-hoodie-gris",
  "polera-basica-blanca",
  "buzo-baggy-negro",
];

const FITTABLE = FITTABLE_SLUGS.map((slug) => catalogService.getBySlug(slug)).filter(
  (p): p is NonNullable<typeof p> => Boolean(p),
);

const modeBtn = (active: boolean) =>
  cn(
    "rounded-full px-4 transition-all duration-300",
    active
      ? "bg-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900"
      : "border border-zinc-200/90 bg-white/80 hover:border-violet-200 dark:border-zinc-700 dark:bg-zinc-900/60",
  );

export function VirtualFittingRoom() {
  const [mode, setMode] = useState<VirtualFittingMode>("mirror");
  const [activeSlug, setActiveSlug] = useState(FITTABLE[0]?.slug ?? "");
  const [selectedSize, setSelectedSize] = useState<Size>("M");
  const [referenceHeight, setReferenceHeight] = useState("170");
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [useCameraMode, setUseCameraMode] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const garmentImgRef = useRef<HTMLImageElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);

  const { videoRef, start: startCamera, stop: stopCamera, ready: cameraReady, error: cameraError } =
    useCamera();
  const poseEnabled = useCameraMode && mode === "mirror";
  const { landmarks, ready: poseReady, error: poseError, attachToVideo, processImage } =
    useMediaPipePose(poseEnabled);

  const active = FITTABLE.find((p) => p.slug === activeSlug) ?? FITTABLE[0];
  const displaySrc = capturedDataUrl ?? null;
  const showLiveVideo = useCameraMode && !capturedDataUrl && mode === "mirror";
  const isDetecting = showLiveVideo && poseReady && !landmarks?.length;

  useEffect(() => {
    if (!active?.images[0]) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = active.images[0];
    img.onload = () => {
      garmentImgRef.current = img;
    };
  }, [active?.images, active?.slug]);

  useEffect(() => {
    if (!landmarks?.length) return;
    const h = Number(referenceHeight) || 170;
    const m = calculateBodyMeasurements(landmarks, h);
    if (m) setMeasurements(m);
  }, [landmarks, referenceHeight]);

  useEffect(() => {
    if (cameraReady && poseReady && videoRef.current && showLiveVideo) {
      void attachToVideo(videoRef.current);
    }
  }, [attachToVideo, cameraReady, poseReady, showLiveVideo, videoRef]);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);

    if (showLiveVideo && video?.videoWidth) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -w, 0, w, h);
      ctx.restore();
    } else if (capturedDataUrl) {
      if (landmarks?.length && garmentImgRef.current?.complete) {
        const params = computeGarmentDrawParams(
          landmarks,
          w,
          h,
          SIZE_OVERLAY_MULTIPLIER[selectedSize],
        );
        if (params) {
          drawPoseSkeleton(ctx, landmarks, w, h);
          drawGarmentOnCanvas(ctx, garmentImgRef.current, params, 0.9);
        }
      }
      return;
    }

    if (landmarks?.length) {
      drawPoseSkeleton(ctx, landmarks, w, h);
      const params = computeGarmentDrawParams(
        landmarks,
        w,
        h,
        SIZE_OVERLAY_MULTIPLIER[selectedSize],
      );
      if (params && garmentImgRef.current?.complete) {
        drawGarmentOnCanvas(ctx, garmentImgRef.current, params, 0.88);
      }
    }
  }, [capturedDataUrl, landmarks, selectedSize, showLiveVideo, videoRef]);

  useEffect(() => {
    if (!showLiveVideo && !capturedDataUrl) return;
    const loop = () => {
      renderFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [capturedDataUrl, renderFrame, showLiveVideo]);

  async function handleStartCamera() {
    setUseCameraMode(true);
    setCapturedDataUrl(null);
    await startCamera();
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !landmarks?.length || !isPoseValid(landmarks)) {
      alert("Espera a que la pose sea válida (barras verdes) antes de capturar.");
      return;
    }
    const snap = document.createElement("canvas");
    snap.width = video.videoWidth;
    snap.height = video.videoHeight;
    const ctx = snap.getContext("2d");
    if (!ctx) return;
    ctx.scale(-1, 1);
    ctx.drawImage(video, -snap.width, 0, snap.width, snap.height);
    setCapturedDataUrl(snap.toDataURL("image/jpeg", 0.92));
    setMode("photo");
    stopCamera();
    void processImage(snap);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_BYTES = 5 * 1024 * 1024;
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (file.size > MAX_BYTES || !allowed.has(file.type)) {
      return;
    }
    setUseCameraMode(false);
    stopCamera();
    const url = URL.createObjectURL(file);
    setCapturedDataUrl(url);
    setMode("photo");
    const img = new window.Image();
    img.onload = () => void processImage(img);
    img.src = url;
  }

  function reset() {
    stopCamera();
    setCapturedDataUrl(null);
    setMeasurements(null);
    setMode("mirror");
    setUseCameraMode(true);
  }

  function downloadResult() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `jotape-tryon-${Date.now()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  }

  const chestForFit = measurements?.waistEstimateCm ?? 99;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <motion.div {...fadeUp(0)}>
        <GlassPanel className="space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-300">
              <Camera className="size-3" />
              Body tracking · MediaPipe
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Probador virtual con cámara
            </h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Detección en tiempo real. Las imágenes no se envían al servidor.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              className={modeBtn(mode === "mirror")}
              onClick={() => setMode("mirror")}
            >
              <Video className="size-4" /> Espejo
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={modeBtn(mode === "photo")}
              onClick={() => setMode("photo")}
              disabled={!capturedDataUrl}
            >
              <ImageIcon className="size-4" /> Foto
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-full bg-zinc-900 dark:bg-zinc-50"
              onClick={() => void handleStartCamera()}
            >
              <Camera className="size-4" /> Activar cámara
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-zinc-200/90"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" /> Subir foto
            </Button>
            {capturedDataUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={reset}
              >
                <RotateCcw className="size-4" /> Reiniciar
              </Button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {(cameraError || poseError) && (
            <p className="rounded-xl border border-red-200/80 bg-red-50/80 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {cameraError ?? poseError}. Usa “Subir foto” como alternativa.
            </p>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Altura de referencia (cm)
            </label>
            <input
              type="number"
              min={130}
              max={220}
              value={referenceHeight}
              onChange={(e) => setReferenceHeight(e.target.value)}
              className={tryOnInputClass}
            />
          </div>

          <BodyMeasurementsPanel measurements={measurements} />

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Prenda
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FITTABLE.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setActiveSlug(p.slug)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300",
                    activeSlug === p.slug
                      ? "border-violet-400 shadow-[0_0_20px_-4px_rgba(168,85,247,0.4)] ring-2 ring-violet-300/25"
                      : "border-zinc-200/80 opacity-85 hover:opacity-100 dark:border-zinc-700",
                  )}
                >
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <SizeComparator
            chestCm={chestForFit}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />

          {showLiveVideo && cameraReady ? (
            <Button
              type="button"
              className="w-full rounded-full bg-zinc-900 dark:bg-zinc-50"
              onClick={handleCapture}
            >
              Capturar foto
            </Button>
          ) : null}

          {capturedDataUrl ? (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              onClick={downloadResult}
            >
              <Download className="size-4" /> Descargar resultado
            </Button>
          ) : null}
        </GlassPanel>
      </motion.div>

      <motion.div
        {...fadeUp(0.1)}
        className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-zinc-800/50 bg-zinc-950 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.5)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(168,85,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12)_0%,transparent_65%)]"
          aria-hidden
        />

        {showLiveVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            playsInline
            muted
          />
        ) : null}
        {displaySrc && !showLiveVideo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt="Captura"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {!showLiveVideo && !displaySrc ? (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-zinc-500">
            Activa la cámara o sube una foto frontal con buena luz.
          </div>
        ) : null}

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {showLiveVideo && !capturedDataUrl ? <SilhouetteGuide /> : null}
        <CameraHudFrame />

        {(showLiveVideo || capturedDataUrl) && (
          <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/90">
              {isDetecting ? (
                <>
                  <motion.span
                    className="size-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  Detectando cuerpo…
                </>
              ) : landmarks?.length ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Cuerpo detectado
                </>
              ) : (
                "Posiciónate al centro"
              )}
            </p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
          <span className="truncate">
            {active?.name ?? "—"} · {selectedSize}
          </span>
          <span className="shrink-0 text-violet-300/90">
            {poseReady ? "MediaPipe" : "…"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
