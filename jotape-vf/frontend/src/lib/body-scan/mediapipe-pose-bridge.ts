import {
  calculateBodyMeasurements,
} from "@/lib/virtual-fitting/measurement-calculator";
import { validateBodyScanPose } from "@/lib/body-scan/body-scan-pose-validation";
import {
  computeHeightCalibration,
  logHeightCalibration,
} from "@/lib/body-scan/height-calibration";
import { analyzeBodySegmentation, disposeBodyScanSegmentationModel } from "@/lib/body-scan/hybrid-segmentation-bridge";
import {
  createMediaPipePose,
  type MediaPipePoseInstance,
} from "@/lib/body-scan/load-mediapipe-pose";
import type { PoseLandmark } from "@/types/virtual-fitting";
import type {
  BodyScanImageCapture,
  BodyScanPoseAnalysis,
  BodyScanView,
} from "@/types/body-scan";

let poseInstance: MediaPipePoseInstance | null = null;
let poseInitPromise: Promise<MediaPipePoseInstance> | null = null;

type PendingDetection = {
  resolve: (result: {
    landmarks: PoseLandmark[];
    poseMask: CanvasImageSource | null;
  }) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

let pendingDetection: PendingDetection | null = null;

function settlePending(
  landmarks: PoseLandmark[],
  poseMask: CanvasImageSource | null = null,
  error?: Error,
): void {
  const pending = pendingDetection;
  if (!pending) return;
  window.clearTimeout(pending.timeoutId);
  pendingDetection = null;
  if (error) pending.reject(error);
  else pending.resolve({ landmarks, poseMask });
}

async function getPoseInstance(): Promise<MediaPipePoseInstance> {
  if (poseInstance) return poseInstance;
  if (poseInitPromise) return poseInitPromise;

  poseInitPromise = (async () => {
    const pose = await createMediaPipePose();

    pose.onResults((results) => {
      const landmarks = (results.poseLandmarks ?? []) as PoseLandmark[];
      if (landmarks.length > 0) {
        settlePending(landmarks, results.segmentationMask ?? null);
      }
    });

    poseInstance = pose;
    return pose;
  })();

  return poseInitPromise;
}

function dataUrlToCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo preparar el canvas de análisis."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen capturada."));
    img.src = dataUrl;
  });
}

async function detectLandmarksOnCanvas(
  canvas: HTMLCanvasElement,
): Promise<{ landmarks: PoseLandmark[]; poseMask: CanvasImageSource | null }> {
  const pose = await getPoseInstance();

  if (pendingDetection) {
    settlePending([], null, new Error("Análisis de pose en curso. Espera un momento."));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      settlePending(
        [],
        null,
        new Error(
          "Tiempo de espera agotado. Comprueba tu conexión o usa otra foto.",
        ),
      );
    }, 25_000);

    pendingDetection = { resolve, reject, timeoutId };

    void pose
      .send({ image: canvas })
      .then(() => {
        window.setTimeout(() => {
          if (!pendingDetection) return;
          settlePending(
            [],
            null,
            new Error(
              "No se detectó una persona en la imagen. Usa foto de cuerpo completo (cabeza a pies).",
            ),
          );
        }, 1200);
      })
      .catch((e: unknown) => {
        settlePending(
          [],
          null,
          e instanceof Error ? e : new Error("Error en MediaPipe Pose"),
        );
      });
  });
}

/** Pipeline activo en cliente (fase 2). */
export function isBodyScanPosePipelineEnabled(): boolean {
  return typeof window !== "undefined";
}

export async function analyzeBodyScanCapture(
  capture: BodyScanImageCapture,
  view: BodyScanView,
  referenceHeightCm = 170,
): Promise<BodyScanPoseAnalysis> {
  if (!isBodyScanPosePipelineEnabled()) {
    return { status: "skipped", analyzedAt: new Date().toISOString() };
  }

  try {
    const canvas = await dataUrlToCanvas(capture.dataUrl);
    const { landmarks, poseMask } = await detectLandmarksOnCanvas(canvas);

    if (!landmarks.length) {
      return {
        status: "error",
        errorMessage: "No se detectó una pose en la imagen.",
        analyzedAt: new Date().toISOString(),
      };
    }

    const measurements = calculateBodyMeasurements(landmarks, referenceHeightCm);
    const quality = measurements?.poseQuality ?? 0;
    const validation = validateBodyScanPose(landmarks, view);

    const minQuality = 0.3;
    if (!measurements || quality < minQuality) {
      return {
        status: "error",
        landmarks,
        quality,
        measurements: measurements ?? undefined,
        errorMessage:
          "La detección es demasiado baja. Usa una foto de cuerpo completo con buena luz.",
        analyzedAt: new Date().toISOString(),
      };
    }

    if (!validation.valid) {
      return {
        status: "error",
        landmarks,
        quality,
        measurements,
        errorMessage: validation.issues.join(" "),
        analyzedAt: new Date().toISOString(),
      };
    }

    const calibration =
      referenceHeightCm > 0
        ? computeHeightCalibration(
            landmarks,
            referenceHeightCm,
            canvas.height,
          )
        : null;

    if (calibration) {
      logHeightCalibration(calibration);
    }

    let segmentation = null;
    let segmentationError: string | undefined;
    if (calibration && calibration.cmPerPixel > 0) {
      segmentation = await analyzeBodySegmentation(
        canvas,
        landmarks,
        view,
        calibration.cmPerPixel,
        poseMask,
      );
      if (segmentation) {
        console.info(
          `[body-scan/${view}] segmentación OK (${segmentation.debug?.maskSource ?? "?"}), calidad:`,
          segmentation.maskQuality.toFixed(2),
        );
      } else {
        segmentationError = "No se pudo extraer medidas de la máscara corporal.";
        console.error(`[body-scan/${view}] ${segmentationError}`);
      }
    } else {
      segmentationError = "Sin calibración de altura (cmPerPixel).";
    }

    return {
      status: "ready",
      landmarks,
      quality,
      measurements,
      calibration: calibration ?? undefined,
      segmentation: segmentation ?? undefined,
      errorMessage: segmentationError,
      analyzedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      status: "error",
      errorMessage:
        e instanceof Error ? e.message : "No se pudo analizar la imagen.",
      analyzedAt: new Date().toISOString(),
    };
  }
}

export function disposeBodyScanPoseModel(): void {
  if (pendingDetection) {
    settlePending([], null, new Error("Análisis cancelado"));
  }
  poseInstance?.close();
  poseInstance = null;
  poseInitPromise = null;
  disposeBodyScanSegmentationModel();
}
