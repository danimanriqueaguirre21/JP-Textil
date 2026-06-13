import type { AvatarZoneScales, FusedBodyMeasurements } from "@/types/avatar-calibration";
import type { BodyMorphInfluences } from "@/types/body-morph";

import { computeAvatarZoneScales } from "@/lib/body-scan/avatar-zone-scales";

/** Escala relativa 1.0 → influencia 0; >1 ensancha, <1 adelgaza (morph relativo). */
const MORPH_GAIN = 1.75;
const MORPH_MIN = -0.32;
const MORPH_MAX = 0.58;

function scaleToInfluence(scale: number): number {
  return Math.min(MORPH_MAX, Math.max(MORPH_MIN, (scale - 1) * MORPH_GAIN));
}

/**
 * Convierte escalas por zona (derivadas de MediaPipe) en influencias de morph targets.
 * Valores negativos reducen volumen; positivos aumentan (sobrepeso, torso ancho, etc.).
 */
function dampMorphForStature(
  influence: number,
  heightScale: number,
): number {
  if (heightScale >= 1) return influence;
  const damp = 0.55 + 0.45 * heightScale;
  if (influence < 0) return influence * damp;
  return influence * (0.85 + 0.15 * heightScale);
}

export function zoneScalesToMorphInfluences(
  zones: AvatarZoneScales,
  heightScale = 1,
): BodyMorphInfluences {
  const bellyScale = (zones.waist + zones.depth + zones.hip) / 3;
  const armBulk = (zones.arm + zones.shoulder) / 2;
  const legBulk = (zones.leg + zones.hip) / 2;

  const raw: BodyMorphInfluences = {
    belly: scaleToInfluence(bellyScale * 1.04),
    chest: scaleToInfluence(zones.chest),
    waist: scaleToInfluence(zones.waist),
    hip: scaleToInfluence(zones.hip),
    arm: scaleToInfluence(armBulk),
    leg: scaleToInfluence(legBulk),
    neck: scaleToInfluence(zones.neck),
  };

  if (heightScale >= 0.995) return raw;

  return {
    belly: dampMorphForStature(raw.belly, heightScale),
    chest: dampMorphForStature(raw.chest, heightScale),
    waist: dampMorphForStature(raw.waist, heightScale),
    hip: dampMorphForStature(raw.hip, heightScale),
    arm: dampMorphForStature(raw.arm, heightScale),
    leg: dampMorphForStature(raw.leg, heightScale),
    neck: dampMorphForStature(raw.neck, heightScale),
  };
}

export function fusedToMorphInfluences(
  fused: FusedBodyMeasurements,
): BodyMorphInfluences {
  return zoneScalesToMorphInfluences(computeAvatarZoneScales(fused));
}
