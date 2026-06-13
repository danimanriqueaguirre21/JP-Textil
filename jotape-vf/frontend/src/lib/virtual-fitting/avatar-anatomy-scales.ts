import type { AvatarZoneScales } from "@/types/avatar-calibration";

import { BASE_HEIGHT_CM } from "@/lib/body-scan/normalize-avatar-measurements";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Una sola capa de altura en el rig + ajustes óseos mínimos (sin neck/head/spine chain).
 */
export type AvatarAnatomyScales = {
  /** Escala Y del grupo avatar (única altura principal). */
  avatarScaleY: number;
  avatarScaleX: number;
  avatarScaleZ: number;
  /** Ajuste fino en muslo/brazo (no acumular en cadena). */
  spineScale: number;
  neckScale: number;
  headScale: number;
  legScale: number;
  armScale: number;
};

export function computeAvatarAnatomyScales(
  heightScale: number,
  widthScale = 1,
  depthScale = 1,
  _zoneScales?: AvatarZoneScales,
): AvatarAnatomyScales {
  const hs = heightScale;

  const avatarScaleY = clamp(1 + (hs - 1) * 0.78, 0.88, 1.12);
  const avatarScaleX = clamp(widthScale, 0.9, 1.12);
  const avatarScaleZ = clamp(depthScale, 0.9, 1.12);

  const legScale = clamp(1 + (hs - 1) * 0.2, 0.96, 1.05);
  const armScale = clamp(1 + (hs - 1) * 0.16, 0.96, 1.05);

  return {
    avatarScaleY,
    avatarScaleX,
    avatarScaleZ,
    spineScale: 1,
    neckScale: 1,
    headScale: 1,
    legScale,
    armScale,
  };
}

export function heightScaleFromCm(heightCm: number): number {
  return heightCm / BASE_HEIGHT_CM;
}

export function logAnatomyScalesDebug(scales: AvatarAnatomyScales): void {
  if (typeof window === "undefined") return;
  console.table({
    avatarScaleY: scales.avatarScaleY,
    avatarScaleX: scales.avatarScaleX,
    avatarScaleZ: scales.avatarScaleZ,
    spineScale: scales.spineScale,
    neckScale: scales.neckScale,
    headScale: scales.headScale,
    legScale: scales.legScale,
    armScale: scales.armScale,
  });
}
