import type { ProportionalAvatarScales } from "@/types/proportional-scales";
import type { BodyType } from "@/types/hybrid-body-scan";
import type { ZoneCircumferenceResult } from "@/lib/body-scan/body-circumference";

export type BodyScanDiagnosticReport = {
  user: {
    altura_cm: number;
    peso_kg: number;
    pixelHeight?: number;
    cmPerPixel?: number;
  };
  detected: {
    ancho_hombros_cm: number;
    pecho_estimado_cm: number;
    cintura_estimada_cm: number;
    cadera_estimada_cm: number;
    profundidad_pecho_cm: number;
    profundidad_abdomen_cm: number;
    profundidad_cadera_cm: number;
  };
  circumference?: {
    waist?: ZoneCircumferenceResult;
    chest?: ZoneCircumferenceResult;
    hip?: ZoneCircumferenceResult;
  };
  classification: {
    bodyType: BodyType;
    bodyFatEstimate: number;
    BMI?: number;
  };
  scales: ProportionalAvatarScales;
  /** Escalas calculadas desde medidas (sin preset). */
  rawScales?: ProportionalAvatarScales;
  /** Preset visual elegido por bodyType. */
  visualPreset?: ProportionalAvatarScales;
  /** Medidas clampadas antes de mezclar. */
  measuredClamped?: ProportionalAvatarScales;
  presetKey?: string;
  visualBlendWeight?: number;
  /** Mapa escala → huesos CC_Base. */
  scaleBoneMap?: Record<string, string>;
  final: {
    heightCm: number;
    weightKg: number;
    shoulderWidthCm: number;
    chestCm: number;
    waistCm: number;
    hipWidthCm: number;
    depthCm: number;
    abdomenDepthCm: number;
    thighWidthCm: number;
    armLengthCm: number;
    legLengthCm: number;
    torsoLengthCm: number;
    proportionalScales: ProportionalAvatarScales;
    bodyType: BodyType;
    bodyFatEstimate: number;
    heightScale: number;
    hasSideView: boolean;
    segmentationUsed: boolean;
  };
  diagnosticMode: true;
};
