import type { BodyMeasurements, PoseLandmark } from "@/types/virtual-fitting";
import type {
  HeightCalibration,
  SegmentationBandMeasures,
} from "@/types/hybrid-body-scan";

/** Vista requerida en la fase 1 del escaneo corporal. */
export type BodyScanView = "front" | "side";

export type BodyScanCaptureSource = "camera" | "upload";

/** Estado de análisis MediaPipe (fase 2). */
export type BodyScanPoseStatus =
  | "idle"
  | "pending"
  | "ready"
  | "error"
  | "skipped";

export type BodyScanPoseAnalysis = {
  status: BodyScanPoseStatus;
  landmarks?: PoseLandmark[];
  /** 0–1 calidad estimada (visibilidad de puntos clave). */
  quality?: number;
  /** Medidas estimadas en cm a partir de landmarks (fase 2). */
  measurements?: BodyMeasurements;
  /** Calibración altura → píxeles (fase 1). */
  calibration?: HeightCalibration;
  /** Medidas desde máscara de segmentación (fase 2). */
  segmentation?: SegmentationBandMeasures;
  errorMessage?: string;
  analyzedAt?: string;
};

export type BodyScanImageCapture = {
  view: BodyScanView;
  dataUrl: string;
  width: number;
  height: number;
  mimeType: string;
  source: BodyScanCaptureSource;
  capturedAt: string;
  /** Reservado para MediaPipe Pose en fase 2. */
  pose?: BodyScanPoseAnalysis;
};

export type BodyScanSessionStatus =
  | "draft"
  | "capturing"
  | "complete";

export type BodyScanSession = {
  id: string;
  status: BodyScanSessionStatus;
  front?: BodyScanImageCapture;
  side?: BodyScanImageCapture;
  createdAt: string;
  updatedAt: string;
};

export type BodyScanWizardStep = "intro" | "front" | "side" | "review";
