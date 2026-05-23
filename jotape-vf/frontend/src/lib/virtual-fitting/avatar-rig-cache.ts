import { AnimationClip, Group, Mesh, Object3D } from "three";

import { applyGltfPoseFrameZero } from "@/lib/virtual-fitting/apply-gltf-pose-frame";
import {
  isCharacterCreatorScene,
  updateSkinnedMeshes,
} from "@/lib/virtual-fitting/avatar-scene-utils";

import { cloneGltfScene } from "@/lib/virtual-fitting/clone-gltf-scene";
import { createAvatarRoot } from "@/lib/virtual-fitting/create-avatar-root";
import { findMainBodyMesh } from "@/lib/virtual-fitting/body-mesh";
import type { AvatarGender } from "@/types/virtual-fitting";

type AvatarTemplate = {
  root: Group;
  bodyMesh: Mesh | null;
};

const templates = new Map<string, AvatarTemplate>();

/**
 * Plantilla de avatar por género (subdivide una sola vez).
 * Cada montaje clona la plantilla → cambio hombre/mujer mucho más rápido.
 */
export type AvatarInstanceOptions = {
  refine?: boolean;
  refineLevels?: number;
  animations?: AnimationClip[];
};

export function getAvatarInstance(
  scene: Object3D,
  gender: AvatarGender,
  options?: AvatarInstanceOptions,
): AvatarTemplate {
  const isCC = isCharacterCreatorScene(scene);
  const refine = isCC ? false : (options?.refine ?? true);
  const levels = options?.refineLevels ?? (gender === "male" ? 1 : 2);
  const cacheKey = `${gender}:${isCC ? "cc" : refine ? levels : "raw"}`;
  if (!templates.has(cacheKey)) {
    const built = createAvatarRoot(scene, { refine, refineLevels: levels });
    templates.set(cacheKey, built);
  }

  const template = templates.get(cacheKey)!;

  const root = cloneGltfScene(template.root);
  smoothAvatarNormals(root);
  // SkeletonUtils.clone resetea huesos: reaplicar pose A del GLB en cada instancia.
  if (options?.animations?.length) {
    applyGltfPoseFrameZero(root, options.animations);
    updateSkinnedMeshes(root);
  }
  const bodyMesh = findMainBodyMesh(root);

  return { root, bodyMesh };
}

function smoothAvatarNormals(root: Group): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.geometry?.computeVertexNormals();
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    for (const mat of mats) {
      if (!mat || !("flatShading" in mat)) continue;
      mat.flatShading = false;
      mat.needsUpdate = true;
    }
  });
}

export function clearAvatarRigCache(): void {
  templates.clear();
}
