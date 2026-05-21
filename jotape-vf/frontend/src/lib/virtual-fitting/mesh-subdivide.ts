import { BufferAttribute, BufferGeometry } from "three";

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

/** Weld de vértices cercanos (evita dependencia ESM de BufferGeometryUtils en Jest). */
function weldVertices(geometry: BufferGeometry, tolerance = 1e-5): BufferGeometry {
  const pos = geometry.getAttribute("position") as BufferAttribute;
  if (!pos) return geometry;

  const key = (x: number, y: number, z: number) =>
    `${Math.round(x / tolerance)}_${Math.round(y / tolerance)}_${Math.round(z / tolerance)}`;

  const map = new Map<string, number>();
  const newPositions: number[] = [];
  const remap: number[] = [];

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = key(x, y, z);
    let idx = map.get(k);
    if (idx === undefined) {
      idx = newPositions.length / 3;
      map.set(k, idx);
      newPositions.push(x, y, z);
    }
    remap.push(idx);
  }

  const welded = new BufferGeometry();
  welded.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(newPositions), 3),
  );

  if (geometry.index) {
    const src = geometry.index;
    const indices = new Uint32Array(src.count);
    for (let i = 0; i < src.count; i++) {
      indices[i] = remap[src.getX(i)]!;
    }
    welded.setIndex(new BufferAttribute(indices, 1));
  } else {
    const indices = new Uint32Array(remap.length);
    for (let i = 0; i < remap.length; i++) indices[i] = remap[i]!;
    welded.setIndex(new BufferAttribute(indices, 1));
  }

  return welded;
}

function triangleCount(geometry: BufferGeometry): number {
  if (geometry.index) return geometry.index.count / 3;
  const pos = geometry.getAttribute("position");
  return pos ? pos.count / 3 : 0;
}

/** Una pasada Loop-style (triángulo → 4 triángulos) con weld de aristas. */
function subdivideOnce(geometry: BufferGeometry): BufferGeometry {
  const posAttr = geometry.getAttribute("position") as BufferAttribute;
  if (!posAttr) return geometry;

  const positions: number[] = Array.from(posAttr.array as ArrayLike<number>);
  const midpointCache = new Map<string, number>();

  const midpoint = (ia: number, ib: number): number => {
    const key = edgeKey(ia, ib);
    const cached = midpointCache.get(key);
    if (cached !== undefined) return cached;

    const idx = positions.length / 3;
    const ax = positions[ia * 3]!;
    const ay = positions[ia * 3 + 1]!;
    const az = positions[ia * 3 + 2]!;
    const bx = positions[ib * 3]!;
    const by = positions[ib * 3 + 1]!;
    const bz = positions[ib * 3 + 2]!;
    positions.push((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    midpointCache.set(key, idx);
    return idx;
  };

  const out: number[] = [];

  const emit = (ia: number, ib: number, ic: number) => {
    const ab = midpoint(ia, ib);
    const bc = midpoint(ib, ic);
    const ca = midpoint(ic, ia);
    const pushTri = (a: number, b: number, c: number) => {
      out.push(
        positions[a * 3]!,
        positions[a * 3 + 1]!,
        positions[a * 3 + 2]!,
        positions[b * 3]!,
        positions[b * 3 + 1]!,
        positions[b * 3 + 2]!,
        positions[c * 3]!,
        positions[c * 3 + 1]!,
        positions[c * 3 + 2]!,
      );
    };
    pushTri(ia, ab, ca);
    pushTri(ab, ib, bc);
    pushTri(ca, bc, ic);
    pushTri(ab, bc, ca);
  };

  if (geometry.index) {
    const index = geometry.index;
    for (let i = 0; i < index.count; i += 3) {
      emit(index.getX(i), index.getX(i + 1), index.getX(i + 2));
    }
  } else {
    for (let i = 0; i < posAttr.count; i += 3) {
      emit(i, i + 1, i + 2);
    }
  }

  const next = new BufferGeometry();
  next.setAttribute("position", new BufferAttribute(new Float32Array(out), 3));
  return next;
}

export type SubdivideOptions = {
  /** Máximo de subdivisiones (1 ≈ ×4 tris, 2 ≈ ×16). */
  levels?: number;
  /** Tope de triángulos tras subdividir. */
  maxTriangles?: number;
};

/**
 * Aumenta densidad de la malla (geometría real, no solo normals).
 * Pensado para basemeshes low-poly exportados sin Subdiv Apply en Blender.
 */
export function subdivideBufferGeometry(
  geometry: BufferGeometry,
  options: SubdivideOptions = {},
): BufferGeometry {
  const maxTriangles = options.maxTriangles ?? 96_000;
  let levels = options.levels ?? 1;

  let geo = geometry.clone();
  const startTris = triangleCount(geo);
  if (startTris < 1) return geo;

  if (startTris < 4_000) levels = Math.max(levels, 2);
  if (startTris > 18_000) levels = 1;

  for (let i = 0; i < levels; i++) {
    if (triangleCount(geo) >= maxTriangles / 4) break;
    geo = subdivideOnce(geo);
  }

  const welded = weldVertices(geo, 1e-5);
  welded.computeVertexNormals();
  return welded;
}

export function countGeometryTriangles(geometry: BufferGeometry): number {
  return triangleCount(geometry);
}
