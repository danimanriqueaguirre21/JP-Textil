"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { KEY_LANDMARK_INDICES } from "@/lib/virtual-fitting/pose-landmarks";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import { BodyScanMeasurementOverlay } from "@/components/body-scan/body-scan-measurement-overlay";
import type { BodyScanImageCapture } from "@/types/body-scan";

type Props = {
  label: string;
  capture: BodyScanImageCapture;
  onRetake: () => void;
  retakeLabel?: string;
};

const POSE_CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 27],
  [24, 28],
  [0, 11],
  [0, 12],
];

function PoseOverlayCanvas({
  dataUrl,
  width,
  height,
  landmarks,
}: {
  dataUrl: string;
  width: number;
  height: number;
  landmarks: NonNullable<BodyScanImageCapture["pose"]>["landmarks"];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks?.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      ctx.strokeStyle = "rgba(167, 139, 250, 0.85)";
      ctx.lineWidth = Math.max(2, width / 400);
      for (const [a, b] of POSE_CONNECTIONS) {
        const p1 = landmarks[a];
        const p2 = landmarks[b];
        if (!p1 || !p2) continue;
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }

      for (const i of KEY_LANDMARK_INDICES) {
        const p = landmarks[i];
        if (!p) continue;
        ctx.beginPath();
        ctx.fillStyle = "rgba(52, 211, 153, 0.95)";
        ctx.arc(p.x * width, p.y * height, Math.max(3, width / 120), 0, Math.PI * 2);
        ctx.fill();
      }
    };
    img.src = dataUrl;
  }, [dataUrl, height, landmarks, width]);

  return (
    <canvas
      ref={canvasRef}
      className="aspect-[3/4] w-full object-contain"
      aria-hidden
    />
  );
}

function PoseStatusBadge({ capture }: { capture: BodyScanImageCapture }) {
  const pose = capture.pose;
  if (!pose || pose.status === "idle" || pose.status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
        <Loader2 className="size-3 animate-spin" />
        Analizando…
      </span>
    );
  }

  if (pose.status === "ready") {
    const q = Math.round((pose.quality ?? 0) * 100);
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
        <CheckCircle2 className="size-3" />
        Pose OK · {q}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-600/90 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
      <AlertCircle className="size-3" />
      Revisar pose
    </span>
  );
}

export function BodyScanPoseThumb({
  label,
  capture,
  onRetake,
  retakeLabel = "Repetir",
}: Props) {
  const diagnostic = isBodyScanDiagnosticMode();
  const hasSeg = Boolean(capture.pose?.segmentation?.maskQuality);
  const showMeasurementOverlay =
    diagnostic &&
    capture.pose?.status === "ready" &&
    hasSeg &&
    capture.pose?.landmarks?.length;

  const showPoseOverlay =
    !showMeasurementOverlay &&
    capture.pose?.status === "ready" &&
    capture.pose.landmarks?.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </p>
        <button
          type="button"
          onClick={onRetake}
          className="text-xs font-medium text-violet-700 hover:underline dark:text-violet-300"
        >
          {retakeLabel}
        </button>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        {showMeasurementOverlay ? (
          <BodyScanMeasurementOverlay capture={capture} />
        ) : showPoseOverlay ? (
          <PoseOverlayCanvas
            dataUrl={capture.dataUrl}
            width={capture.width}
            height={capture.height}
            landmarks={capture.pose?.landmarks}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capture.dataUrl}
            alt={label}
            className="aspect-[3/4] w-full object-contain"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <PoseStatusBadge capture={capture} />
          {diagnostic && (
            <span className="rounded-lg bg-amber-500/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
              DIAG
            </span>
          )}
        </div>
        <div className="absolute bottom-2 left-2 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
          {capture.width}×{capture.height}
        </div>
      </div>
      {capture.pose?.status === "error" && capture.pose.errorMessage && (
        <p className="text-xs text-amber-700 dark:text-amber-300" role="alert">
          {capture.pose.errorMessage}
        </p>
      )}
    </div>
  );
}
