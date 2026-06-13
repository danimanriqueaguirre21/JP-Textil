"use client";

import { useEffect, useRef } from "react";

import { getBodyBandLevels } from "@/lib/body-scan/extract-segmentation-measures";
import { POSE_LANDMARK } from "@/lib/virtual-fitting/pose-landmarks";
import type { BodyScanImageCapture } from "@/types/body-scan";

type BandSpec = {
  key: string;
  label: string;
  y: number;
  widthCm: number;
  color: string;
};

function buildFrontBands(
  capture: BodyScanImageCapture,
): BandSpec[] {
  const seg = capture.pose?.segmentation;
  const lm = capture.pose?.landmarks;
  if (!seg || !lm) return [];

  const bands = getBodyBandLevels(lm, capture.height);
  if (!bands) return [];

  return [
    { key: "shoulder", label: "Hombros", y: bands.shoulder, widthCm: seg.shoulderWidthCm, color: "#a78bfa" },
    { key: "chest", label: "Pecho", y: bands.chest, widthCm: seg.chestWidthCm, color: "#60a5fa" },
    { key: "waist", label: "Cintura", y: bands.waist, widthCm: seg.waistWidthCm, color: "#fbbf24" },
    { key: "abdomen", label: "Abdomen", y: bands.abdomen, widthCm: seg.abdomenWidthCm, color: "#fb923c" },
    { key: "hip", label: "Cadera", y: bands.hip, widthCm: seg.hipWidthCm, color: "#f472b6" },
    { key: "thigh", label: "Muslo", y: bands.thigh, widthCm: seg.thighWidthCm, color: "#34d399" },
  ].filter((b) => b.widthCm > 0);
}

function buildSideBands(capture: BodyScanImageCapture): BandSpec[] {
  const seg = capture.pose?.segmentation;
  const lm = capture.pose?.landmarks;
  if (!seg || !lm) return [];

  const bands = getBodyBandLevels(lm, capture.height);
  if (!bands) return [];

  return [
    { key: "chestD", label: "Prof. pecho", y: bands.chest, widthCm: seg.chestDepthCm ?? 0, color: "#60a5fa" },
    { key: "abdomenD", label: "Prof. abd.", y: bands.abdomen, widthCm: seg.abdomenDepthCm ?? 0, color: "#fb923c" },
    { key: "hipD", label: "Prof. cadera", y: bands.hip, widthCm: seg.hipDepthCm ?? 0, color: "#f472b6" },
    { key: "gluteD", label: "Prof. glúteo", y: bands.glute, widthCm: seg.gluteDepthCm ?? 0, color: "#e879f9" },
  ].filter((b) => b.widthCm > 0);
}

function bodyCenterX(
  landmarks: NonNullable<BodyScanImageCapture["pose"]>["landmarks"],
  width: number,
): number {
  if (!landmarks) return width / 2;
  const ls = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARK.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARK.RIGHT_HIP];
  const xs = [ls?.x, rs?.x, lh?.x, rh?.x].filter((v) => v !== undefined) as number[];
  if (!xs.length) return width / 2;
  return (xs.reduce((a, b) => a + b, 0) / xs.length) * width;
}

type Props = {
  capture: BodyScanImageCapture;
  showPose?: boolean;
};

export function BodyScanMeasurementOverlay({ capture, showPose = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bands =
    capture.view === "front" ? buildFrontBands(capture) : buildSideBands(capture);
  const cmPerPixel = capture.pose?.calibration?.cmPerPixel ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const lm = capture.pose?.landmarks;
    if (!canvas || !lm?.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, dataUrl } = capture;
    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const cx = bodyCenterX(lm, width);

      if (showPose) {
        ctx.strokeStyle = "rgba(167, 139, 250, 0.5)";
        ctx.lineWidth = Math.max(1, width / 500);
        const pairs: [number, number][] = [
          [11, 12], [11, 23], [12, 24], [23, 24], [23, 27], [24, 28],
        ];
        for (const [a, b] of pairs) {
          const p1 = lm[a];
          const p2 = lm[b];
          if (!p1 || !p2) continue;
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }
      }

      for (const band of bands) {
        const spanPx =
          cmPerPixel > 0 ? band.widthCm / cmPerPixel : band.widthCm * 2;
        const half = spanPx / 2;
        const y = band.y;

        ctx.strokeStyle = band.color;
        ctx.fillStyle = band.color;
        ctx.lineWidth = Math.max(2, width / 350);

        ctx.beginPath();
        ctx.moveTo(cx - half, y);
        ctx.lineTo(cx + half, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx - half, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + half, y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `bold ${Math.max(10, width / 55)}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        const text = `${band.label}: ${band.widthCm} cm`;
        const tw = ctx.measureText(text).width;
        ctx.fillRect(cx - tw / 2 - 4, y - 18, tw + 8, 16);
        ctx.fillStyle = "#fff";
        ctx.fillText(text, cx - tw / 2, y - 6);
      }
    };
    img.src = dataUrl;
  }, [bands, capture, cmPerPixel, showPose]);

  if (!bands.length) return null;

  return (
    <canvas
      ref={canvasRef}
      className="aspect-[3/4] w-full object-contain"
      aria-label="Medidas detectadas sobre la foto"
    />
  );
}
