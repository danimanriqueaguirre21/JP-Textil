import type { PoseLandmark } from "@/types/virtual-fitting";

import { POSE_LANDMARK } from "./pose-landmarks";

export type GarmentDrawParams = {
  shoulderY: number;
  hipY: number;
  centerX: number;
  torsoWidth: number;
  sizeMultiplier: number;
  opacity: number;
};

/** Calcula caja de dibujo de prenda a partir de landmarks normalizados (0–1). */
export function computeGarmentDrawParams(
  landmarks: PoseLandmark[],
  canvasWidth: number,
  canvasHeight: number,
  sizeMultiplier: number,
): GarmentDrawParams | null {
  const ls = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARK.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARK.RIGHT_HIP];
  if (!ls || !rs || !lh || !rh) return null;

  const shoulderY = ((ls.y + rs.y) / 2) * canvasHeight;
  const hipY = ((lh.y + rh.y) / 2) * canvasHeight;
  const centerX = ((ls.x + rs.x + lh.x + rh.x) / 4) * canvasWidth;
  const shoulderSpan = Math.abs(rs.x - ls.x) * canvasWidth;
  const torsoWidth = shoulderSpan * 1.35 * sizeMultiplier;

  return {
    shoulderY,
    hipY,
    centerX,
    torsoWidth,
    sizeMultiplier,
    opacity: 0.92,
  };
}

export function drawGarmentOnCanvas(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  params: GarmentDrawParams,
  opacity = params.opacity,
): void {
  const garmentHeight = Math.max(40, params.hipY - params.shoulderY + params.torsoWidth * 0.15);
  const garmentWidth = params.torsoWidth;
  const x = params.centerX - garmentWidth / 2;
  const y = params.shoulderY - garmentHeight * 0.08;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(image, x, y, garmentWidth, garmentHeight);
  ctx.restore();
}

export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: PoseLandmark[],
  width: number,
  height: number,
): void {
  const ls = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARK.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARK.RIGHT_HIP];
  if (!ls || !rs || !lh || !rh) return;

  ctx.save();
  ctx.strokeStyle = "rgba(34, 197, 94, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ls.x * width, ls.y * height);
  ctx.lineTo(rs.x * width, rs.y * height);
  ctx.lineTo(((lh.x + rh.x) / 2) * width, ((lh.y + rh.y) / 2) * height);
  ctx.lineTo(lh.x * width, lh.y * height);
  ctx.lineTo(rh.x * width, rh.y * height);
  ctx.stroke();

  for (const p of [ls, rs, lh, rh]) {
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
    ctx.fill();
  }
  ctx.restore();
}
