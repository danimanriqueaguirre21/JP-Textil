import { Group, Mesh } from "three";

import { cloneGltfScene } from "@/lib/virtual-fitting/clone-gltf-scene";
import {
  applyBodyMaterial,
  isAvatarClothingMesh,
} from "@/lib/virtual-fitting/avatar-mesh-utils";
import {
  applySolidMaterialFlags,
  createHairMaterial,
  createSkinMaterial,
} from "@/lib/virtual-fitting/avatar-materials";
import {
  isCharacterCreatorScene,
  stripMorphTargets,
} from "@/lib/virtual-fitting/avatar-scene-utils";
import { findMainBodyMesh } from "@/lib/virtual-fitting/body-mesh";
import { refineAvatarRoot } from "@/lib/virtual-fitting/refine-avatar-mesh";
import type { Object3D } from "three";

export type CreateAvatarRootOptions = {
  /** true = malla suavizada (recomendado). false = GLB crudo (se ve facetado/cuadrado). */
  refine?: boolean;
  /** Pasadas de subdivisión (1 recomendado con ropa GLB exportada del mismo avatar). */
  refineLevels?: number;
};

export function createAvatarRoot(
  scene: Object3D,
  options: CreateAvatarRootOptions = {},
): {
  root: Group;
  bodyMesh: Mesh | null;
} {
  const clone = cloneGltfScene(scene);
  const isCC = isCharacterCreatorScene(clone);

  if (isCC) {
    stripMorphTargets(clone);
  }

  clone.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const name = (node.name || "").toLowerCase();
    if (name.includes("eye") && !isCC) {
      node.visible = false;
      return;
    }
    if (isCC) {
      node.frustumCulled = false;
    }
    if (isAvatarClothingMesh(name)) {
      node.visible = false;
      return;
    }
    if (name.includes("hair")) {
      applyBodyMaterial(node, createHairMaterial());
      return;
    }
    if (!isCC) {
      applyBodyMaterial(node, createSkinMaterial());
    } else {
      const mats = Array.isArray(node.material)
        ? node.material
        : [node.material];
      for (const mat of mats) {
        if (mat) applySolidMaterialFlags(mat);
      }
    }
  });

  const bodyMesh = findMainBodyMesh(clone);

  if (options.refine !== false && !isCC) {
    refineAvatarRoot(clone, { levels: options.refineLevels });
  } else {
    clone.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      node.geometry?.computeVertexNormals();
    });
  }

  return { root: clone, bodyMesh };
}
