import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  Vector3,
} from "three";

import type { AvatarGender } from "@/types/virtual-fitting";

const GARMENT_NODE = /vf-garment|tshirt|shorts/i;

export function findMainBodyMesh(root: Group): Mesh | null {
  let best: Mesh | null = null;
  let bestCount = 0;

  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const name = (node.name || "").toLowerCase();
    if (!node.visible || name.includes("eye") || GARMENT_NODE.test(name)) return;

    const count = node.geometry?.attributes?.position?.count ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = node;
    }
  });

  return best;
}

export type TorsoBounds = {
  yMin: number;
  yMax: number;
  centerX: number;
  centerZ: number;
  halfWidthX: number;
  halfWidthZ: number;
};

const TORSO_REGION: Record<AvatarGender, { yMinRatio: number; yMaxRatio: number }> = {
  male: { yMinRatio: 0.52, yMaxRatio: 0.78 },
  female: { yMinRatio: 0.5, yMaxRatio: 0.76 },
};

/** Límites del pecho en espacio local del body mesh (solo ajuste fino de prenda GLB). */
export function getTorsoBounds(
  geometry: BufferGeometry,
  gender: AvatarGender,
): TorsoBounds {
  const pos = geometry.getAttribute("position") as BufferAttribute;
  const box = new Box3();
  const v = new Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    box.expandByPoint(v);
  }

  const region = TORSO_REGION[gender];
  const height = box.max.y - box.min.y;
  const yMin = box.min.y + height * region.yMinRatio;
  const yMax = box.min.y + height * region.yMaxRatio;

  let sliceMinX = Infinity;
  let sliceMaxX = -Infinity;
  let sliceMinZ = Infinity;
  let sliceMaxZ = -Infinity;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (v.y < yMin || v.y > yMax) continue;
    sliceMinX = Math.min(sliceMinX, v.x);
    sliceMaxX = Math.max(sliceMaxX, v.x);
    sliceMinZ = Math.min(sliceMinZ, v.z);
    sliceMaxZ = Math.max(sliceMaxZ, v.z);
  }

  const spanX =
    Number.isFinite(sliceMinX) ? sliceMaxX - sliceMinX : box.max.x - box.min.x;
  const spanZ =
    Number.isFinite(sliceMinZ) ? sliceMaxZ - sliceMinZ : box.max.z - box.min.z;

  return {
    yMin,
    yMax,
    centerX: (box.min.x + box.max.x) / 2,
    centerZ: (box.min.z + box.max.z) / 2,
    halfWidthX: spanX * 0.22,
    halfWidthZ: Math.max(spanZ * 0.2, spanX * 0.12),
  };
}

export type BodyRegionSlice = {
  center: Vector3;
  size: Vector3;
};

/**
 * Mide torso/cadera sin contar brazos en T-pose (solo vértices cerca del eje central).
 */
export function getBodyRegionSlice(
  geometry: BufferGeometry,
  region: {
    yMinRatio: number;
    yMaxRatio: number;
    yMaxCapRatio?: number;
    widthPad: number;
    depthPad: number;
    heightPad: number;
    coreHalfWidthFactor: number;
    minDepthToHeight: number;
    maxWidthToHeight: number;
    maxDepthToHeight: number;
  },
): BodyRegionSlice {
  const pos = geometry.getAttribute("position") as BufferAttribute;
  const full = new Box3();
  const v = new Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    full.expandByPoint(v);
  }

  const bodyH = full.max.y - full.min.y;
  const centerX = (full.min.x + full.max.x) * 0.5;
  const centerZ = (full.min.z + full.max.z) * 0.5;
  const yMin = full.min.y + bodyH * region.yMinRatio;
  let yMax = full.min.y + bodyH * region.yMaxRatio;
  if (region.yMaxCapRatio != null) {
    yMax = Math.min(yMax, full.min.y + bodyH * region.yMaxCapRatio);
  }
  const coreHalf = bodyH * region.coreHalfWidthFactor;

  const core = new Box3();
  let hasCore = false;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (v.y < yMin || v.y > yMax) continue;
    if (Math.abs(v.x - centerX) > coreHalf) continue;
    core.expandByPoint(v);
    hasCore = true;
  }

  const slice = hasCore ? core : full;
  const sliceCenterX = (slice.min.x + slice.max.x) * 0.5;
  const sliceCenterZ = (slice.min.z + slice.max.z) * 0.5;
  const spanX = slice.max.x - slice.min.x;
  const spanZ = slice.max.z - slice.min.z;

  const width = Math.min(
    spanX * region.widthPad,
    bodyH * region.maxWidthToHeight,
  );
  // Profundidad centrada en el torso para cubrir frente y espalda.
  const depth = Math.min(
    Math.max(spanZ * region.depthPad, bodyH * region.minDepthToHeight),
    bodyH * region.maxDepthToHeight,
  );
  const height = (yMax - yMin) * region.heightPad;

  return {
    center: new Vector3(
      sliceCenterX,
      (yMin + yMax) * 0.5,
      sliceCenterZ,
    ),
    size: new Vector3(width, height, depth),
  };
}
