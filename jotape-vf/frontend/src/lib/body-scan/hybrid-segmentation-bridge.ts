import {
  createMediaPipeSegmentation,
  type MediaPipeSegmentationInstance,
} from "@/lib/body-scan/load-mediapipe-segmentation";
import { extractSegmentationMeasures } from "@/lib/body-scan/extract-segmentation-measures";
import type { BodyScanView } from "@/types/body-scan";
import type { SegmentationBandMeasures } from "@/types/hybrid-body-scan";
import type { PoseLandmark } from "@/types/virtual-fitting";

let segInstance: MediaPipeSegmentationInstance | null = null;
let segInitPromise: Promise<MediaPipeSegmentationInstance> | null = null;

type PendingSeg = {
  resolve: (mask: CanvasImageSource | null) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

let pendingSeg: PendingSeg | null = null;

function settleSeg(mask: CanvasImageSource | null, error?: Error): void {
  const p = pendingSeg;
  if (!p) return;
  window.clearTimeout(p.timeoutId);
  pendingSeg = null;
  if (error) p.reject(error);
  else p.resolve(mask);
}

async function getSegmentationInstance(): Promise<MediaPipeSegmentationInstance> {
  if (segInstance) return segInstance;
  if (segInitPromise) return segInitPromise;

  segInitPromise = (async () => {
    console.info("[segmentation] cargando MediaPipe Selfie Segmentation…");
    const seg = await createMediaPipeSegmentation();
    seg.onResults((results) => {
      settleSeg(results.segmentationMask ?? null);
    });
    segInstance = seg;
    console.info("[segmentation] Selfie Segmentation listo");
    return seg;
  })().catch((e) => {
    segInitPromise = null;
    console.error("[segmentation] fallo al cargar Selfie Segmentation:", e);
    throw e;
  });

  return segInitPromise;
}

async function runSelfieSegmentation(
  canvas: HTMLCanvasElement,
): Promise<CanvasImageSource | null> {
  const seg = await getSegmentationInstance();

  if (pendingSeg) {
    settleSeg(null, new Error("Segmentación en curso."));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      settleSeg(null, new Error("Tiempo agotado en segmentación corporal."));
    }, 25_000);

    pendingSeg = { resolve, reject, timeoutId };

    void seg
      .send({ image: canvas })
      .then(() => {
        window.setTimeout(() => {
          if (!pendingSeg) return;
          settleSeg(null, new Error("No se obtuvo máscara corporal (timeout 2s)."));
        }, 2000);
      })
      .catch((e: unknown) => {
        settleSeg(
          null,
          e instanceof Error ? e : new Error("Error en Selfie Segmentation"),
        );
      });
  });
}

function extractFromMask(
  mask: CanvasImageSource,
  landmarks: PoseLandmark[],
  view: BodyScanView,
  cmPerPixel: number,
  canvas: HTMLCanvasElement,
  source: "selfie" | "pose",
): SegmentationBandMeasures | null {
  return extractSegmentationMeasures(
    mask,
    landmarks,
    view,
    cmPerPixel,
    canvas.width,
    canvas.height,
    source,
  );
}

export async function analyzeBodySegmentation(
  canvas: HTMLCanvasElement,
  landmarks: PoseLandmark[],
  view: BodyScanView,
  cmPerPixel: number,
  poseMask?: CanvasImageSource | null,
): Promise<SegmentationBandMeasures | null> {
  try {
    let selfieMask: CanvasImageSource | null = null;
    try {
      selfieMask = await runSelfieSegmentation(canvas);
    } catch (e) {
      console.warn(
        `[segmentation/${view}] Selfie Segmentation falló:`,
        e instanceof Error ? e.message : e,
      );
    }

    if (selfieMask) {
      const fromSelfie = extractFromMask(
        selfieMask,
        landmarks,
        view,
        cmPerPixel,
        canvas,
        "selfie",
      );
      if (fromSelfie) return fromSelfie;
      console.warn(`[segmentation/${view}] Selfie mask sin medidas válidas`);
    }

    if (poseMask) {
      console.info(`[segmentation/${view}] usando máscara de Pose como fallback`);
      const fromPose = extractFromMask(
        poseMask,
        landmarks,
        view,
        cmPerPixel,
        canvas,
        "pose",
      );
      if (fromPose) return fromPose;
      console.warn(`[segmentation/${view}] Pose mask sin medidas válidas`);
    }

    console.error(`[segmentation/${view}] sin máscara utilizable`);
    return null;
  } catch (e) {
    console.error(
      `[segmentation/${view}] error:`,
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

export function disposeBodyScanSegmentationModel(): void {
  if (pendingSeg) {
    settleSeg(null, new Error("Segmentación cancelada"));
  }
  segInstance?.close();
  segInstance = null;
  segInitPromise = null;
}
