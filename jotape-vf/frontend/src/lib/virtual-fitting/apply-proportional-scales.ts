import { Bone, Object3D } from "three";

import { updateSkinnedMeshes } from "@/lib/virtual-fitting/avatar-scene-utils";
import { isBodyScanDiagnosticMode } from "@/lib/body-scan/body-scan-diagnostic-mode";
import { resolveAvatarVisualScales } from "@/lib/body-scan/body-visual-presets";
import { formatScaleBoneMapForDiagnostic } from "@/lib/body-scan/avatar-scale-bone-map";
import {
  logProportionalScalesDebug,
  computeProportionalScales,
  proportionalInputFromCalibration,
} from "@/lib/body-scan/compute-proportional-scales";
import { logBodyScanDiagnostic } from "@/lib/body-scan/log-body-scan-diagnostic";
import type { AvatarCalibration } from "@/types/avatar-calibration";
import type {
  ProportionalAvatarScales,
  ProportionalScaleInput,
} from "@/types/proportional-scales";
import type { BodyType } from "@/types/hybrid-body-scan";

function boneName(name: string): string {
  return name.toLowerCase();
}

/** Cabeza, cuello, manos, pies y extremidades inferiores del brazo/pierna. */
function isNeverScaled(name: string): boolean {
  return /head|neck|eye|jaw|teeth|tongue|facial|tear|hand|finger|toe|thumb|index|mid|ring|pinky|foot|ankle|heel|ball|metatars|forearm|calf|shin|lowerarm|lowerleg|twist|sharebone/i.test(
    name,
  );
}

function isUpperArm(name: string): boolean {
  return /upperarm|uparm/.test(name) && !/forearm|twist|share|hand/.test(name);
}

function isUpperThigh(name: string): boolean {
  return /thigh/.test(name) && !/twist|share|calf|foot|toe|shin/.test(name);
}

function isChest(name: string): boolean {
  return /spine01|spine_01|ribs|chest/.test(name) && !/hip|thigh|neck|head/.test(name);
}

function isWaistAbdomen(name: string): boolean {
  return (
    /spine02|spine03|spine_02|spine_03|waist|abdomen|belly/.test(name) &&
    !/hip|thigh|neck|head|chest/.test(name)
  );
}

function isHipPelvis(name: string): boolean {
  return (/hip|pelvis/.test(name) || name === "hip") && !/thigh/.test(name);
}

function mulAxis(bone: Bone, axis: "x" | "y" | "z", factor: number): void {
  if (Math.abs(factor - 1) < 0.002) return;
  bone.scale[axis] *= factor;
}

/**
 * Deformación visual solo en: pecho, abdomen/cintura, cadera, brazos superiores, muslos.
 * Cabeza, cuello, manos, pies y antebrazos/pantorrillas quedan intactos.
 */
export function applyProportionalScales(
  root: Object3D,
  scales: ProportionalAvatarScales,
): void {
  root.traverse((node) => {
    if (!(node instanceof Bone)) return;
    const name = boneName(node.name);
    if (isNeverScaled(name)) return;

    if (isUpperArm(name)) {
      mulAxis(node, "x", scales.armScaleX);
      return;
    }

    if (isChest(name)) {
      mulAxis(node, "x", scales.chestScaleX);
      mulAxis(node, "z", scales.chestDepthZ);
      return;
    }

    if (isWaistAbdomen(name)) {
      mulAxis(node, "x", scales.waistScaleX);
      mulAxis(node, "z", scales.abdomenDepthZ);
      mulAxis(node, "y", scales.torsoScaleY);
      return;
    }

    if (isHipPelvis(name)) {
      mulAxis(node, "x", scales.hipScaleX);
      mulAxis(node, "z", scales.bodyDepthZ);
      return;
    }

    if (isUpperThigh(name)) {
      mulAxis(node, "x", scales.thighScaleX);
    }
  });

  updateSkinnedMeshes(root);
}

/** Hombros: clavícula solo en X (ancho), sin comprimir vertical. */
export function applyShoulderProportionalScale(
  root: Object3D,
  shoulderScaleX: number,
): void {
  if (Math.abs(shoulderScaleX - 1) < 0.002) return;
  root.traverse((node) => {
    if (!(node instanceof Bone)) return;
    if (!/clavicle/.test(boneName(node.name))) return;
    mulAxis(node, "x", shoulderScaleX);
  });
  updateSkinnedMeshes(root);
}

function visualScalesForCalibration(
  calibration: AvatarCalibration,
  computed: ReturnType<typeof computeProportionalScales>,
): ProportionalAvatarScales {
  const bodyType = (calibration.bodyType ?? "AVERAGE") as BodyType;
  const raw =
    computed.rawScales ??
    calibration.proportionalScales ??
    computed.scales;
  return resolveAvatarVisualScales(raw, bodyType).final;
}

export function applyProportionalCalibration(
  root: Object3D,
  calibration: AvatarCalibration,
): ProportionalAvatarScales {
  const input = proportionalInputFromCalibration(calibration);
  const diagnostic = isBodyScanDiagnosticMode();
  const computed = computeProportionalScales(input);
  const visualScales = visualScalesForCalibration(calibration, computed);

  applyProportionalScales(root, visualScales);
  applyShoulderProportionalScale(root, visualScales.shoulderScaleX);

  if (diagnostic) {
    const report = buildBodyScanDiagnosticReportFromCalibration(
      calibration,
      visualScales,
      computed.rawScales,
      computed.visual,
    );
    if (report) logBodyScanDiagnostic(report);
  } else {
    logProportionalScalesDebug(computed.debug);
  }
  return visualScales;
}

function buildBodyScanDiagnosticReportFromCalibration(
  cal: AvatarCalibration,
  scales: ProportionalAvatarScales,
  rawScales?: ProportionalAvatarScales,
  visual?: import("@/lib/body-scan/body-visual-presets").VisualScaleResolution,
) {
  if (typeof window === "undefined") return null;
  return {
    user: {
      altura_cm: cal.heightCm,
      peso_kg: cal.weightKg,
    },
    detected: {
      ancho_hombros_cm: cal.shoulderWidthCm,
      pecho_estimado_cm: cal.chestCm,
      cintura_estimada_cm: cal.waistCm,
      cadera_estimada_cm: cal.hipWidthCm,
      profundidad_pecho_cm: cal.depthCm,
      profundidad_abdomen_cm: cal.abdomenDepthCm ?? cal.depthCm,
      profundidad_cadera_cm: cal.depthCm,
    },
    classification: {
      bodyType: cal.bodyType ?? "AVERAGE",
      bodyFatEstimate: cal.bodyFatEstimate ?? 0,
    },
    scales,
    rawScales,
    visualPreset: visual?.preset,
    measuredClamped: visual?.measuredClamped,
    presetKey: visual?.presetKey,
    visualBlendWeight: visual?.blendWeight,
    scaleBoneMap: formatScaleBoneMapForDiagnostic(),
    final: {
      heightCm: cal.heightCm,
      weightKg: cal.weightKg,
      shoulderWidthCm: cal.shoulderWidthCm,
      chestCm: cal.chestCm,
      waistCm: cal.waistCm,
      hipWidthCm: cal.hipWidthCm,
      depthCm: cal.depthCm,
      abdomenDepthCm: cal.abdomenDepthCm ?? cal.depthCm,
      thighWidthCm: cal.thighWidthCm ?? 0,
      armLengthCm: cal.armLengthCm,
      legLengthCm: cal.legLengthCm,
      torsoLengthCm: cal.torsoLengthCm,
      proportionalScales: scales,
      bodyType: cal.bodyType ?? "AVERAGE",
      bodyFatEstimate: cal.bodyFatEstimate ?? 0,
      heightScale: cal.heightCm / 170,
      hasSideView: cal.hasSideView ?? false,
      segmentationUsed: cal.hybridDiagnostics?.segmentationUsed ?? false,
    },
    diagnosticMode: true as const,
  };
}

export function applyProportionalFromInput(
  root: Object3D,
  input: ProportionalScaleInput,
): ProportionalAvatarScales {
  const computed = computeProportionalScales(input);
  const visualScales = resolveAvatarVisualScales(
    computed.rawScales,
    input.bodyType ?? "AVERAGE",
  ).final;
  applyProportionalScales(root, visualScales);
  applyShoulderProportionalScale(root, visualScales.shoulderScaleX);
  logProportionalScalesDebug(computed.debug);
  return visualScales;
}
