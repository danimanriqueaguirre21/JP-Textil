import { POSE_LANDMARK } from "@/lib/virtual-fitting/pose-landmarks";
import type { BodyScanView } from "@/types/body-scan";
import type { SegmentationBandMeasures } from "@/types/hybrid-body-scan";
import type { PoseLandmark } from "@/types/virtual-fitting";

const MASK_THRESHOLD = 0.18;
const ROW_HALF_BAND = 4;

export type SegmentationExtractDebug = {
  maskWidth: number;
  maskHeight: number;
  bodyPixelArea: number;
  waistPixels: number;
  chestPixels: number;
  hipPixels: number;
  shoulderPixels: number;
  cmPerPixel: number;
  maskSource: "selfie" | "pose";
  maskPixelMax: number;
  imageWidth: number;
  imageHeight: number;
};

type BandY = {
  shoulder: number;
  chest: number;
  waist: number;
  abdomen: number;
  hip: number;
  thigh: number;
  glute: number;
};

export function getBodyBandLevels(
  landmarks: PoseLandmark[],
  imageHeight: number,
): BandY | null {
  return computeBandY(landmarks, imageHeight);
}

function landmarkY(lm: PoseLandmark, imageHeight: number): number {
  return lm.y * imageHeight;
}

function computeBandY(landmarks: PoseLandmark[], imageHeight: number): BandY | null {
  const ls = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
  const rs = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];
  const lh = landmarks[POSE_LANDMARK.LEFT_HIP];
  const rh = landmarks[POSE_LANDMARK.RIGHT_HIP];
  const lk = landmarks[POSE_LANDMARK.LEFT_KNEE];
  if (!ls || !rs || !lh || !rh || !lk) return null;

  const shoulder = (landmarkY(ls, imageHeight) + landmarkY(rs, imageHeight)) / 2;
  const hip = (landmarkY(lh, imageHeight) + landmarkY(rh, imageHeight)) / 2;
  const thigh = (landmarkY(lh, imageHeight) + landmarkY(lk, imageHeight)) / 2;
  const torso = Math.max(20, hip - shoulder);

  return {
    shoulder,
    chest: shoulder + torso * 0.18,
    waist: shoulder + torso * 0.48,
    abdomen: shoulder + torso * 0.58,
    hip,
    thigh,
    glute: hip + torso * 0.08,
  };
}

function maskPixelValue(data: Uint8ClampedArray, i: number): number {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  return Math.max(r, g, b, a) / 255;
}

function maskToAlphaGrid(
  mask: CanvasImageSource,
  width: number,
  height: number,
): { data: Uint8ClampedArray; pixelMax: number } | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(mask, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  let pixelMax = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixelMax = Math.max(pixelMax, maskPixelValue(imageData.data, i));
  }
  return { data: imageData.data, pixelMax };
}

function analyzeMaskBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { maskWidth: number; maskHeight: number; bodyPixelArea: number } {
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let bodyPixelArea = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (maskPixelValue(data, i) >= MASK_THRESHOLD) {
        bodyPixelArea++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (bodyPixelArea === 0) {
    return { maskWidth: 0, maskHeight: 0, bodyPixelArea: 0 };
  }

  return {
    maskWidth: maxX - minX + 1,
    maskHeight: maxY - minY + 1,
    bodyPixelArea,
  };
}

function spanAtRow(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerY: number,
): { spanPx: number; left: number; right: number; coverage: number } | null {
  let bestSpan = 0;
  let bestLeft = 0;
  let bestRight = 0;
  let bestCoverage = 0;

  for (let dy = -ROW_HALF_BAND; dy <= ROW_HALF_BAND; dy++) {
    const y = Math.round(centerY + dy);
    if (y < 0 || y >= height) continue;

    let left = -1;
    let right = -1;
    let hits = 0;

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (maskPixelValue(data, i) >= MASK_THRESHOLD) {
        hits++;
        if (left === -1) left = x;
        right = x;
      }
    }

    if (left === -1) continue;
    const span = right - left + 1;
    const coverage = hits / width;
    if (span > bestSpan) {
      bestSpan = span;
      bestLeft = left;
      bestRight = right;
      bestCoverage = coverage;
    }
  }

  if (bestSpan <= 0) return null;
  return {
    spanPx: bestSpan,
    left: bestLeft,
    right: bestRight,
    coverage: bestCoverage,
  };
}

function spanToCm(spanPx: number, cmPerPixel: number): number {
  return Math.round(spanPx * cmPerPixel * 10) / 10;
}

export function logSegmentationExtractDebug(
  view: BodyScanView,
  debug: SegmentationExtractDebug,
): void {
  if (typeof window === "undefined") return;
  console.info(`[segmentation/${view}] máscara (${debug.maskSource})`);
  console.table({
    maskWidth: debug.maskWidth,
    maskHeight: debug.maskHeight,
    bodyPixelArea: debug.bodyPixelArea,
    waistPixels: debug.waistPixels,
    chestPixels: debug.chestPixels,
    hipPixels: debug.hipPixels,
    shoulderPixels: debug.shoulderPixels,
    cmPerPixel: debug.cmPerPixel.toFixed(4),
    maskPixelMax: debug.maskPixelMax.toFixed(3),
    imageSize: `${debug.imageWidth}x${debug.imageHeight}`,
  });
}

export function extractSegmentationMeasures(
  mask: CanvasImageSource,
  landmarks: PoseLandmark[],
  view: BodyScanView,
  cmPerPixel: number,
  imageWidth: number,
  imageHeight: number,
  maskSource: "selfie" | "pose" = "selfie",
): SegmentationBandMeasures | null {
  const bands = computeBandY(landmarks, imageHeight);
  const grid = maskToAlphaGrid(mask, imageWidth, imageHeight);
  if (!bands || !grid || cmPerPixel <= 0) return null;

  const { data, pixelMax } = grid;
  const bounds = analyzeMaskBounds(data, imageWidth, imageHeight);
  if (bounds.bodyPixelArea < 100) {
    console.warn(
      `[segmentation/${view}] máscara vacía (area=${bounds.bodyPixelArea}, max=${pixelMax.toFixed(2)})`,
    );
    return null;
  }

  const shoulder = spanAtRow(data, imageWidth, imageHeight, bands.shoulder);
  const chest = spanAtRow(data, imageWidth, imageHeight, bands.chest);
  const waist = spanAtRow(data, imageWidth, imageHeight, bands.waist);
  const abdomen = spanAtRow(data, imageWidth, imageHeight, bands.abdomen);
  const hip = spanAtRow(data, imageWidth, imageHeight, bands.hip);
  const thigh = spanAtRow(data, imageWidth, imageHeight, bands.thigh);
  const glute = spanAtRow(data, imageWidth, imageHeight, bands.glute);

  const debug: SegmentationExtractDebug = {
    maskWidth: bounds.maskWidth,
    maskHeight: bounds.maskHeight,
    bodyPixelArea: bounds.bodyPixelArea,
    waistPixels: waist?.spanPx ?? 0,
    chestPixels: chest?.spanPx ?? 0,
    hipPixels: hip?.spanPx ?? 0,
    shoulderPixels: shoulder?.spanPx ?? 0,
    cmPerPixel,
    maskSource,
    maskPixelMax: pixelMax,
    imageWidth,
    imageHeight,
  };
  logSegmentationExtractDebug(view, debug);

  if (!shoulder && !chest && !waist && !hip) return null;

  const coverages = [shoulder, chest, waist, hip, thigh]
    .filter(Boolean)
    .map((s) => s!.coverage);
  const maskQuality =
    coverages.length > 0
      ? Math.min(1, (coverages.reduce((a, b) => a + b, 0) / coverages.length) * 6)
      : 0;

  const base: SegmentationBandMeasures = {
    shoulderWidthCm: spanToCm((shoulder ?? chest ?? waist)?.spanPx ?? 0, cmPerPixel),
    chestWidthCm: spanToCm((chest ?? shoulder)?.spanPx ?? 0, cmPerPixel),
    waistWidthCm: spanToCm((waist ?? abdomen ?? hip)?.spanPx ?? 0, cmPerPixel),
    abdomenWidthCm: spanToCm((abdomen ?? waist)?.spanPx ?? 0, cmPerPixel),
    hipWidthCm: spanToCm((hip ?? waist)?.spanPx ?? 0, cmPerPixel),
    thighWidthCm: spanToCm((thigh ?? hip)?.spanPx ?? 0, cmPerPixel),
    maskQuality,
    debug,
  };

  if (view === "side") {
    const chestD = chest ?? shoulder;
    const abdD = abdomen ?? waist;
    const hipD = hip ?? glute;
    base.chestDepthCm = spanToCm(chestD?.spanPx ?? 0, cmPerPixel);
    base.abdomenDepthCm = spanToCm(abdD?.spanPx ?? 0, cmPerPixel);
    base.hipDepthCm = spanToCm(hipD?.spanPx ?? 0, cmPerPixel);
    base.gluteDepthCm = spanToCm((glute ?? hipD)?.spanPx ?? 0, cmPerPixel);
    base.shoulderWidthCm = 0;
    base.chestWidthCm = 0;
    base.waistWidthCm = 0;
    base.abdomenWidthCm = 0;
    base.hipWidthCm = 0;
    base.thighWidthCm = 0;
  }

  return base;
}

export {
  estimateCircumferenceCm,
  ellipseCircumferenceRawCm,
} from "@/lib/body-scan/body-circumference";
