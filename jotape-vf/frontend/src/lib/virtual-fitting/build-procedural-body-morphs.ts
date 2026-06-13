import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  SkinnedMesh,
} from "three";

import { sanitizeMeshMorphTargets } from "@/lib/virtual-fitting/mesh-morph-utils";
import type { BodyMorphZone } from "@/types/body-morph";
import { BODY_MORPH_TARGET_NAMES, BODY_MORPH_ZONES } from "@/types/body-morph";
import type { AvatarGender } from "@/types/virtual-fitting";

const morphReady = new WeakSet<BufferGeometry>();

type MorphTemplate = {
  morphPositions: BufferAttribute[];
  dictionary: Record<string, number>;
};

/** Evita regenerar morphs vf_* en cada clon (CC ~36MB / muchos vértices). */
const morphTemplateCache = new Map<string, MorphTemplate>();

function morphTemplateKey(gender: AvatarGender, vertexCount: number): string {
  return `${gender}:${vertexCount}`;
}

function applyMorphTemplate(mesh: Mesh, template: MorphTemplate): void {
  const geometry = mesh.geometry;
  geometry.morphAttributes.position = template.morphPositions.map((attr) =>
    attr.clone(),
  );
  mesh.morphTargetDictionary = { ...template.dictionary };
  mesh.morphTargetInfluences = new Array(template.morphPositions.length).fill(0);
  if (mesh instanceof SkinnedMesh) {
    mesh.morphTargetsRelative = false;
  }
  morphReady.add(geometry);
}

type YBand = { y0: number; y1: number };

type GenderBands = Record<BodyMorphZone, YBand> & {
  armY0: number;
  armY1: number;
  armXMin: number;
  legY1: number;
};

const BANDS: Record<AvatarGender, GenderBands> = {
  male: {
    neck: { y0: 0.78, y1: 0.9 },
    chest: { y0: 0.58, y1: 0.74 },
    waist: { y0: 0.5, y1: 0.6 },
    belly: { y0: 0.44, y1: 0.56 },
    hip: { y0: 0.34, y1: 0.48 },
    arm: { y0: 0.35, y1: 0.72 },
    leg: { y0: 0.02, y1: 0.38 },
    armY0: 0.35,
    armY1: 0.72,
    armXMin: 0.1,
    legY1: 0.38,
  },
  female: {
    neck: { y0: 0.76, y1: 0.88 },
    chest: { y0: 0.56, y1: 0.72 },
    waist: { y0: 0.48, y1: 0.58 },
    belly: { y0: 0.42, y1: 0.54 },
    hip: { y0: 0.32, y1: 0.46 },
    arm: { y0: 0.33, y1: 0.7 },
    leg: { y0: 0.02, y1: 0.36 },
    armY0: 0.33,
    armY1: 0.7,
    armXMin: 0.09,
    legY1: 0.36,
  },
};

/** Intensidad máxima del desplazamiento radial (metros locales del bind pose). */
const RADIAL_PUSH: Record<BodyMorphZone, number> = {
  belly: 0.028,
  chest: 0.022,
  waist: 0.02,
  hip: 0.024,
  arm: 0.014,
  leg: 0.016,
  neck: 0.012,
};

const BELLY_FORWARD = 0.018;

function smoothBand(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function inBand(yNorm: number, band: YBand): number {
  if (yNorm < band.y0 || yNorm > band.y1) return 0;
  const mid = (band.y0 + band.y1) / 2;
  const half = (band.y1 - band.y0) / 2;
  return smoothBand(1 - Math.abs(yNorm - mid) / half);
}

function readPosition(
  pos: BufferAttribute,
  i: number,
): { x: number; y: number; z: number } {
  if (typeof pos.getX === "function") {
    return { x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) };
  }
  const base = i * 3;
  const arr = pos.array as Float32Array;
  return { x: arr[base], y: arr[base + 1], z: arr[base + 2] };
}

function meshHeightBounds(geometry: BufferGeometry): {
  minY: number;
  maxY: number;
} {
  const pos = geometry.getAttribute("position") as BufferAttribute;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const { y } = readPosition(pos, i);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minY, maxY: maxY > minY ? maxY : minY + 1 };
}

function zoneWeight(
  x: number,
  y: number,
  z: number,
  yNorm: number,
  bands: GenderBands,
  zone: BodyMorphZone,
): number {
  if (zone === "arm") {
    const ax = Math.abs(x);
    if (ax < bands.armXMin) return 0;
    if (yNorm < bands.armY0 || yNorm > bands.armY1) return 0;
    return smoothBand(ax / 0.35) * inBand(yNorm, bands.arm);
  }

  if (zone === "leg") {
    if (yNorm > bands.legY1) return 0;
    const ax = Math.abs(x);
    if (ax < 0.06) return 0;
    return inBand(yNorm, bands.leg) * smoothBand(ax / 0.22);
  }

  const band = bands[zone];
  const core = inBand(yNorm, band);
  if (core <= 0) return 0;

  const ax = Math.abs(x);
  if (zone === "neck" && ax > 0.2) return 0;
  if (
    (zone === "chest" || zone === "waist" || zone === "belly" || zone === "hip") &&
    ax > 0.28
  ) {
    return core * 0.15;
  }

  return core;
}

function buildZoneMorphAttribute(
  geometry: BufferGeometry,
  gender: AvatarGender,
  zone: BodyMorphZone,
): Float32BufferAttribute {
  const pos = geometry.getAttribute("position") as BufferAttribute;
  const count = pos.count;
  const delta = new Float32Array(count * 3);
  const { minY, maxY } = meshHeightBounds(geometry);
  const height = maxY - minY;
  const bands = BANDS[gender];
  const push = RADIAL_PUSH[zone];

  for (let i = 0; i < count; i++) {
    const { x, y, z } = readPosition(pos, i);
    const yNorm = (y - minY) / height;
    const w = zoneWeight(x, y, z, yNorm, bands, zone);
    if (w <= 0) continue;

    const radial = Math.hypot(x, z) || 1e-6;
    const dirX = x / radial;
    const dirZ = z / radial;
    const amount = push * w;

    delta[i * 3] += dirX * amount;
    delta[i * 3 + 2] += dirZ * amount;

    if (zone === "belly") {
      delta[i * 3 + 2] += BELLY_FORWARD * w;
    }
    if (zone === "chest") {
      delta[i * 3 + 1] += push * 0.15 * w;
    }
  }

  return new Float32BufferAttribute(delta, 3);
}

function normalizeMorphAttribute(
  attr: BufferAttribute | Float32Array,
): BufferAttribute {
  if (attr instanceof BufferAttribute) return attr;
  return new Float32BufferAttribute(attr, 3);
}

function hasMorphName(mesh: Mesh, name: string): boolean {
  const idx = mesh.morphTargetDictionary?.[name];
  const count = mesh.geometry.morphAttributes?.position?.length ?? 0;
  return typeof idx === "number" && idx >= 0 && idx < count;
}

/**
 * Añade morph targets `vf_*` al body mesh si el GLB no los trae exportados.
 */
export function ensureProceduralBodyMorphs(
  mesh: Mesh,
  gender: AvatarGender,
): void {
  const geometry = mesh.geometry;
  if (morphReady.has(geometry)) {
    sanitizeMeshMorphTargets(mesh);
    return;
  }

  const pos = geometry.getAttribute("position") as BufferAttribute | undefined;
  const templateKey =
    pos?.count != null ? morphTemplateKey(gender, pos.count) : null;
  const cached = templateKey ? morphTemplateCache.get(templateKey) : undefined;
  if (cached) {
    applyMorphTemplate(mesh, cached);
    sanitizeMeshMorphTargets(mesh);
    return;
  }

  sanitizeMeshMorphTargets(mesh);

  const morphPositions: BufferAttribute[] = [];
  const dictionary: Record<string, number> = {};

  const existing = geometry.morphAttributes.position ?? [];
  for (const zone of BODY_MORPH_ZONES) {
    const name = BODY_MORPH_TARGET_NAMES[zone];
    const prevIdx = mesh.morphTargetDictionary?.[name];
    if (
      typeof prevIdx === "number" &&
      prevIdx >= 0 &&
      prevIdx < existing.length &&
      existing[prevIdx]
    ) {
      dictionary[name] = morphPositions.length;
      morphPositions.push(normalizeMorphAttribute(existing[prevIdx]));
      continue;
    }
    dictionary[name] = morphPositions.length;
    morphPositions.push(buildZoneMorphAttribute(geometry, gender, zone));
  }

  geometry.morphAttributes.position = morphPositions;
  mesh.morphTargetDictionary = dictionary;
  mesh.morphTargetInfluences = new Array(morphPositions.length).fill(0);
  if (mesh instanceof SkinnedMesh) {
    mesh.morphTargetsRelative = false;
  }

  sanitizeMeshMorphTargets(mesh);

  try {
    geometry.computeBoundingSphere();
  } catch {
    /* bounding opcional */
  }

  if (templateKey) {
    morphTemplateCache.set(templateKey, {
      morphPositions: morphPositions.map((attr) => attr.clone()),
      dictionary: { ...dictionary },
    });
  }

  morphReady.add(geometry);
}
