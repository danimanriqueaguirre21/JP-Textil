import {
  BufferAttribute,
  Float32BufferAttribute,
  Mesh,
  Object3D,
} from "three";

/**
 * Three.js revienta en render si hay morphAttributes pero morphTargetInfluences
 * es undefined o su length no coincide.
 */
export function sanitizeMeshMorphTargets(mesh: Mesh): void {
  const positionMorphs = mesh.geometry.morphAttributes?.position;
  const count = Array.isArray(positionMorphs) ? positionMorphs.length : 0;

  if (count === 0) {
    mesh.morphTargetDictionary = {};
    mesh.morphTargetInfluences = [];
    if (mesh.geometry.morphAttributes?.position?.length) {
      mesh.geometry.morphAttributes = {};
    }
    return;
  }

  const allValid = positionMorphs.every(
    (attr) =>
      attr instanceof BufferAttribute ||
      attr instanceof Float32BufferAttribute,
  );

  if (!allValid) {
    clearMeshMorphTargets(mesh);
    return;
  }

  const influences = mesh.morphTargetInfluences;
  if (!influences || influences.length !== count) {
    const prev = influences ?? [];
    mesh.morphTargetInfluences = Array.from({ length: count }, (_, i) =>
      Number.isFinite(prev[i]) ? prev[i] : 0,
    );
  }

  const dict = mesh.morphTargetDictionary;
  if (!dict) {
    mesh.morphTargetDictionary = {};
    return;
  }

  let invalid = false;
  for (const idx of Object.values(dict)) {
    if (typeof idx !== "number" || idx < 0 || idx >= count) {
      invalid = true;
      break;
    }
  }

  if (invalid) {
    const next: Record<string, number> = {};
    for (const [name, idx] of Object.entries(dict)) {
      if (typeof idx === "number" && idx >= 0 && idx < count) {
        next[name] = idx;
      }
    }
    mesh.morphTargetDictionary = next;
  }
}

export function clearMeshMorphTargets(mesh: Mesh): void {
  mesh.morphTargetDictionary = {};
  mesh.morphTargetInfluences = [];
  mesh.geometry.morphAttributes = {};
  if ("morphTargetsRelative" in mesh.geometry) {
    mesh.geometry.morphTargetsRelative = false;
  }
}

export function sanitizeMorphTargets(root: Object3D): void {
  root.traverse((node) => {
    if (node instanceof Mesh) sanitizeMeshMorphTargets(node);
  });
}
