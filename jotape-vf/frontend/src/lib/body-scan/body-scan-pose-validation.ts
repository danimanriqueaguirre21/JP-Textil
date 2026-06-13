import { KEY_LANDMARK_INDICES } from "@/lib/virtual-fitting/pose-landmarks";
import type { PoseLandmark } from "@/types/virtual-fitting";
import type { BodyScanView } from "@/types/body-scan";

export type BodyScanPoseValidation = {
  valid: boolean;
  issues: string[];
};

const MIN_VISIBILITY = 0.25;

function landmarkVisible(lm: PoseLandmark | undefined): boolean {
  return (lm?.visibility ?? 0) >= MIN_VISIBILITY;
}

/**
 * Comprueba que la pose sea utilizable para medidas (cuerpo completo en frame).
 */
export function validateBodyScanPose(
  landmarks: PoseLandmark[],
  view: BodyScanView,
): BodyScanPoseValidation {
  const issues: string[] = [];

  if (!landmarks.length) {
    return { valid: false, issues: ["No se detectó ninguna persona en la imagen."] };
  }

  const missing = KEY_LANDMARK_INDICES.filter(
    (i) => !landmarkVisible(landmarks[i]),
  );

  if (missing.length > 0) {
    issues.push(
      "Asegúrate de que cabeza, hombros, cadera y tobillos sean visibles.",
    );
  }

  const ls = landmarks[11];
  const rs = landmarks[12];
  const la = landmarks[27];
  const ra = landmarks[28];
  const nose = landmarks[0];

  if (ls && rs && la && ra && nose) {
    const ankleY = (la.y + ra.y) / 2;
    const bodySpan = Math.abs(ankleY - nose.y);
    if (bodySpan < 0.32) {
      issues.push("Aleja la cámara: el cuerpo debe ocupar más altura en el encuadre.");
    }
    if (bodySpan > 0.98) {
      issues.push("Aléjate un poco: la cabeza o los pies podrían estar recortados.");
    }
  }

  if (view === "front" && ls && rs) {
    const shoulderSpan = Math.abs(ls.x - rs.x);
    if (shoulderSpan < 0.08) {
      issues.push("Separa un poco los brazos del torso en la vista frontal.");
    }
  }

  if (view === "side" && ls && rs) {
    const shoulderOverlap = Math.abs(ls.x - rs.x);
    if (shoulderOverlap > 0.12) {
      issues.push("Gira más hacia la izquierda para una vista lateral clara.");
    }
  }

  return { valid: issues.length === 0, issues };
}
