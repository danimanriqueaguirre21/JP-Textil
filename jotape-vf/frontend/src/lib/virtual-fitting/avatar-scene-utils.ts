import {
  Box3,
  BufferAttribute,
  Float32BufferAttribute,
  Mesh,
  Object3D,
  SkinnedMesh,
  Vector3,
} from "three";

import {
  clearMeshMorphTargets,
  sanitizeMeshMorphTargets,
  sanitizeMorphTargets,
} from "@/lib/virtual-fitting/mesh-morph-utils";
import { BODY_MORPH_TARGET_NAMES } from "@/types/body-morph";

export { sanitizeMorphTargets } from "@/lib/virtual-fitting/mesh-morph-utils";

const _point = new Vector3();

const VF_MORPH_NAMES = new Set(Object.values(BODY_MORPH_TARGET_NAMES));
const VF_MORPH_RE = /^vf_/i;

/** Avatar Character Creator exportado desde Blender (CC_Base_*). */
export function isCharacterCreatorScene(scene: Object3D): boolean {
  let found = false;
  scene.traverse((node) => {
    if (node.name?.startsWith("CC_Base")) found = true;
  });
  return found;
}

/**
 * Morphs CC (100+) rompen WebGL; influences undefined provoca .length en el renderer.
 */
export function stripMorphTargets(root: Object3D): void {
  root.traverse((node) => {
    if (node instanceof Mesh) clearMeshMorphTargets(node);
  });
}

/**
 * En avatares CC conserva solo morphs `vf_*` corporales; elimina expresiones faciales.
 */
export function pruneCcMorphTargetsKeepingBody(root: Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    pruneMeshMorphTargets(node);
  });
}

function pruneMeshMorphTargets(mesh: Mesh): void {
  const morphCount = mesh.geometry.morphAttributes?.position?.length ?? 0;
  const dict = mesh.morphTargetDictionary;
  const influences = mesh.morphTargetInfluences;

  if (
    morphCount > 0 &&
    (!influences || influences.length !== morphCount)
  ) {
    clearMeshMorphTargets(mesh);
    return;
  }

  if (!dict || !Object.keys(dict).length) {
    if (morphCount > 0) clearMeshMorphTargets(mesh);
    else sanitizeMeshMorphTargets(mesh);
    return;
  }

  const entries = Object.entries(dict).filter(
    ([name]) => VF_MORPH_RE.test(name) || VF_MORPH_NAMES.has(name),
  );

  if (entries.length > 0) {
    const oldPositions = mesh.geometry.morphAttributes.position ?? [];
    const newPositions: BufferAttribute[] = [];
    const newDict: Record<string, number> = {};
    entries.forEach(([name, idx]) => {
      const raw = oldPositions[idx];
      if (raw instanceof BufferAttribute) {
        newDict[name] = newPositions.length;
        newPositions.push(raw);
      } else if (raw instanceof Float32Array) {
        newDict[name] = newPositions.length;
        newPositions.push(new Float32BufferAttribute(raw, 3));
      }
    });
    mesh.geometry.morphAttributes.position = newPositions;
    mesh.morphTargetDictionary = newDict;
    mesh.morphTargetInfluences = new Array(newPositions.length).fill(0);
    sanitizeMeshMorphTargets(mesh);
    return;
  }

  if (Object.keys(dict).length > 12) {
    clearMeshMorphTargets(mesh);
  } else {
    sanitizeMeshMorphTargets(mesh);
  }
}

function safeComputeBoundingSphere(mesh: SkinnedMesh): void {
  const morphs = mesh.geometry.morphAttributes.position;
  if (
    morphs?.length &&
    morphs.some((attr) => !(attr instanceof BufferAttribute))
  ) {
    return;
  }
  try {
    mesh.geometry.computeBoundingSphere();
  } catch {
    /* morphs mal formados: el rig usa caja por huesos */
  }
}

export function updateSkinnedMeshes(root: Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof SkinnedMesh)) return;
    node.skeleton?.update();
    safeComputeBoundingSphere(node);
  });
}

/** Caja desde huesos (fiable en skinned CC tras SkeletonUtils.clone). */
function measureBoxFromBones(root: Object3D): Box3 | null {
  const box = new Box3();
  let count = 0;
  root.updateMatrixWorld(true);
  root.traverse((node) => {
    if (node.type !== "Bone") return;
    node.getWorldPosition(_point);
    box.expandByPoint(_point);
    count++;
  });
  if (count === 0) return null;
  const h = box.max.y - box.min.y;
  if (h < 0.5) return null;
  return box;
}

/** Caja en mundo para centrar/escalar el avatar. */
export function measureAvatarWorldBox(root: Object3D): Box3 {
  root.updateMatrixWorld(true);
  updateSkinnedMeshes(root);

  const boneBox = measureBoxFromBones(root);
  if (boneBox) return boneBox;

  return new Box3().setFromObject(root);
}
