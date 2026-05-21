import type { Size } from "@/lib/sizing/recommender";

export type AvatarGender = "male" | "female";

/** Landmark normalizado de MediaPipe Pose (0–1 en el frame). */
export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type PoseLandmarks = PoseLandmark[];

export type BodyMeasurements = {
  shoulderWidthCm: number;
  hipWidthCm: number;
  waistEstimateCm: number;
  heightEstimateCm: number;
  /** 0–1 calidad de detección (visibilidad media de puntos clave). */
  poseQuality: number;
};

export type FitLevel = "perfect" | "regular" | "loose" | "tight";

export type SizeFitResult = {
  size: Size;
  level: FitLevel;
  diffPercent: number;
  label: string;
};

export type GarmentOverlayConfig = {
  size: Size;
  opacity: number;
  sizeMultiplier: number;
};

export type VirtualFittingMode = "mirror" | "photo";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "positioning"
  | "detecting"
  | "captured"
  | "error";
