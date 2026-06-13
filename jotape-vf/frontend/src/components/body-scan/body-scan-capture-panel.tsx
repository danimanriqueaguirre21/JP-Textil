"use client";

import { motion } from "framer-motion";
import {
  Camera,
  ImagePlus,
  RefreshCw,
  SwitchCamera,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CameraHudFrame, GlassPanel } from "@/components/try-on/try-on-ui";
import { BodyScanSilhouette } from "@/components/body-scan/body-scan-silhouette";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { captureFromFile, captureFromVideo } from "@/lib/body-scan/capture-frame";
import { BODY_SCAN_VIEW_HINTS } from "@/lib/body-scan/scan-instructions";
import { cn } from "@/lib/utils";
import type {
  BodyScanCaptureSource,
  BodyScanImageCapture,
  BodyScanView,
} from "@/types/body-scan";

type CaptureMode = "camera" | "upload";

type Props = {
  view: BodyScanView;
  existing?: BodyScanImageCapture;
  analysisError?: string | null;
  onConfirm: (capture: BodyScanImageCapture) => Promise<void>;
  onCancel?: () => void;
  onClearError?: () => void;
};

export function BodyScanCapturePanel({
  view,
  existing,
  analysisError,
  onConfirm,
  onCancel,
  onClearError,
}: Props) {
  const hints = BODY_SCAN_VIEW_HINTS[view];
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<CaptureMode>("camera");
  const [preview, setPreview] = useState<BodyScanImageCapture | null>(
    existing ?? null,
  );
  const [pendingSource, setPendingSource] =
    useState<BodyScanCaptureSource | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const { videoRef, start, stop, ready, error: cameraError } = useCamera({
    facingMode,
    width: 1280,
    height: 720,
  });

  useEffect(() => {
    if (mode !== "camera") {
      stop();
      return;
    }
    void start();
    return () => stop();
  }, [mode, facingMode, start, stop]);

  const buildCapture = useCallback(
    (
      frame: { dataUrl: string; width: number; height: number; mimeType: string },
      source: BodyScanCaptureSource,
    ): BodyScanImageCapture => ({
      view,
      dataUrl: frame.dataUrl,
      width: frame.width,
      height: frame.height,
      mimeType: frame.mimeType,
      source,
      capturedAt: new Date().toISOString(),
      pose: { status: "idle" },
    }),
    [view],
  );

  const handleShutter = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const frame = captureFromVideo(video);
    if (!frame) return;
    setPreview(buildCapture(frame, "camera"));
    setPendingSource("camera");
    stop();
  }, [buildCapture, stop, videoRef]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setUploadError(null);
      try {
        const frame = await captureFromFile(file);
        setPreview(buildCapture(frame, "upload"));
        setPendingSource("upload");
        stop();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al subir imagen";
        setUploadError(msg);
      }
    },
    [buildCapture, stop],
  );

  const handleRetake = useCallback(() => {
    setPreview(null);
    setPendingSource(null);
    setUploadError(null);
    onClearError?.();
    if (mode === "camera") void start();
  }, [mode, onClearError, start]);

  const handleConfirm = useCallback(async () => {
    if (!preview || confirming) return;
    setConfirming(true);
    try {
      await onConfirm(preview);
    } finally {
      setConfirming(false);
    }
  }, [confirming, onConfirm, preview]);

  const toggleCamera = () => {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
  };

  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="border-b border-white/60 px-5 py-4 dark:border-zinc-800/80">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600/90 dark:text-violet-400">
          {hints.title}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {hints.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/60 px-5 py-3 dark:border-zinc-800/80">
        <Button
          type="button"
          size="sm"
          variant={mode === "camera" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setMode("camera")}
        >
          <Camera className="size-4" />
          Cámara
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "upload" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => {
            setMode("upload");
            stop();
          }}
        >
          <ImagePlus className="size-4" />
          Subir foto
        </Button>
        {mode === "camera" && !preview && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="ml-auto rounded-full"
            onClick={toggleCamera}
          >
            <SwitchCamera className="size-4" />
            Voltear
          </Button>
        )}
      </div>

      <div className="relative bg-zinc-950">
        <div className="relative mx-auto aspect-[3/4] max-h-[min(72vh,640px)] w-full max-w-md overflow-hidden">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.dataUrl}
              alt={`Vista ${view === "front" ? "frontal" : "lateral"} capturada`}
              className="size-full object-contain"
            />
          ) : mode === "camera" ? (
            <>
              <video
                ref={videoRef}
                className={cn(
                  "size-full object-cover",
                  facingMode === "user" && "[transform:scaleX(-1)]",
                )}
                playsInline
                muted
                aria-label="Vista previa de cámara para escaneo corporal"
              />
              <BodyScanSilhouette view={view} />
              <CameraHudFrame />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-16">
                <p className="text-center text-xs font-medium text-white/90">
                  Alinea tu cuerpo dentro del marco punteado
                </p>
              </div>
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-900 to-zinc-950 px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <ImagePlus className="size-8" />
              </span>
              <p className="text-sm text-zinc-300">
                Sube una foto de cuerpo completo en{" "}
                {view === "front" ? "vista frontal" : "vista lateral"}.
              </p>
              {uploadError && (
                <p className="text-sm text-red-400" role="alert">
                  {uploadError}
                </p>
              )}
              <Button
                type="button"
                className="rounded-full"
                onClick={() => fileRef.current?.click()}
              >
                Elegir imagen
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
            </div>
          )}

          {cameraError && mode === "camera" && !preview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/90 px-6 text-center">
              <p className="text-sm text-red-300">{cameraError}</p>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-zinc-600 text-zinc-100"
                onClick={() => void start()}
              >
                Reintentar cámara
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-zinc-300"
                onClick={() => setMode("upload")}
              >
                Usar subida de imagen
              </Button>
            </div>
          )}
        </div>

        {(analysisError || uploadError) && (
          <div
            className="border-t border-amber-500/30 bg-amber-950/90 px-4 py-3 text-center text-sm text-amber-100"
            role="alert"
          >
            {analysisError ?? uploadError}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-zinc-800/80 bg-zinc-950/95 px-4 py-4">
          {preview ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-zinc-600 text-zinc-100 hover:bg-zinc-800"
                onClick={handleRetake}
              >
                <RefreshCw className="size-4" />
                Repetir
              </Button>
              <Button
                type="button"
                className="rounded-full bg-violet-600 hover:bg-violet-500"
                disabled={confirming}
                onClick={() => void handleConfirm()}
              >
                {confirming ? "Analizando…" : "Usar esta foto"}
              </Button>
            </>
          ) : mode === "camera" ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              disabled={!ready}
              onClick={handleShutter}
              className={cn(
                "flex size-16 items-center justify-center rounded-full border-4 border-white/90 bg-white shadow-lg transition",
                "disabled:opacity-40 disabled:shadow-none",
              )}
              aria-label="Capturar foto"
            >
              <span className="size-12 rounded-full bg-violet-600" />
            </motion.button>
          ) : null}

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              className="rounded-full text-zinc-400"
              onClick={onCancel}
            >
              Atrás
            </Button>
          )}
        </div>
      </div>

      {pendingSource && preview && (
        <p className="sr-only">
          Captura desde {pendingSource === "camera" ? "cámara" : "archivo"}
        </p>
      )}

    </GlassPanel>
  );
}
