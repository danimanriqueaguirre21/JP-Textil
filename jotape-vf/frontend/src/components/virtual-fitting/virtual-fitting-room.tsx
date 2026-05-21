"use client";

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
      // La foto de fondo la pinta el <img>; el canvas solo lleva pose + prenda.
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
      <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Camera className="h-3 w-3" /> Eyecey-style · MVP
          </div>
          <h3 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Probador virtual con cámara
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            MediaPipe detecta hombros y cadera; la prenda se superpone en tiempo real.
            Las imágenes no se envían al servidor.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "mirror" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setMode("mirror")}
          >
            <Video className="h-4 w-4" /> Espejo
          </Button>
          <Button
            type="button"
            variant={mode === "photo" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setMode("photo")}
            disabled={!capturedDataUrl}
          >
            <ImageIcon className="h-4 w-4" /> Foto
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="rounded-full" onClick={() => void handleStartCamera()}>
            <Camera className="h-4 w-4" /> Activar cámara
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Subir foto
          </Button>
          {capturedDataUrl ? (
            <Button type="button" variant="ghost" className="rounded-full" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reiniciar
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
          <p className="text-sm text-red-600 dark:text-red-400">
            {cameraError ?? poseError}. Usa “Subir foto” como alternativa.
          </p>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Altura de referencia (cm)
          </label>
          <input
            type="number"
            min={130}
            max={220}
            value={referenceHeight}
            onChange={(e) => setReferenceHeight(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>

        <BodyMeasurementsPanel measurements={measurements} />

        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Prenda
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FITTABLE.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setActiveSlug(p.slug)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl border",
                  activeSlug === p.slug
                    ? "ring-2 ring-zinc-900 dark:ring-zinc-50"
                    : "border-zinc-200 dark:border-zinc-800",
                )}
              >
                <Image src={p.images[0]} alt={p.name} fill sizes="64px" className="object-cover" />
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
          <Button type="button" className="w-full rounded-full" onClick={handleCapture}>
            Capturar foto
          </Button>
        ) : null}

        {capturedDataUrl ? (
          <Button type="button" variant="outline" className="w-full rounded-full" onClick={downloadResult}>
            <Download className="h-4 w-4" /> Descargar resultado
          </Button>
        ) : null}
      </div>

      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900 shadow-sm dark:border-zinc-800">
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
          <img src={displaySrc} alt="Captura" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        {!showLiveVideo && !displaySrc ? (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-zinc-400">
            Activa la cámara o sube una foto frontal con buena luz.
          </div>
        ) : null}

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {showLiveVideo && !capturedDataUrl ? <SilhouetteGuide /> : null}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl bg-black/55 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white backdrop-blur">
          <span>{active?.name ?? "—"} · {selectedSize}</span>
          <span>{poseReady ? "MediaPipe" : "…"}</span>
        </div>
      </div>
    </div>
  );
}
