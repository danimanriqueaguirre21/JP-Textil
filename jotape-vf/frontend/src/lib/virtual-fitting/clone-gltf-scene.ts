import { Group, Material, Mesh, MeshStandardMaterial, Object3D } from "three";
import { SkeletonUtils } from "three-stdlib";

import { applySolidMaterialFlags } from "@/lib/virtual-fitting/avatar-materials";

function smoothClonedMeshes(root: Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.geometry?.computeVertexNormals();
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    for (const mat of mats) {
      if (!mat) continue;
      applySolidMaterialFlags(mat as Material);
      if (mat instanceof MeshStandardMaterial) {
        mat.flatShading = false;
        mat.wireframe = false;
        mat.needsUpdate = true;
      }
    }
  });
}

/** Clona escena GLB sin mutar el caché de useGLTF (soporta skinned meshes). */
export function cloneGltfScene(scene: Object3D): Group {
  let cloned: Group | null = null;

  try {
    cloned = SkeletonUtils.clone(scene) as Group;
  } catch {
    cloned = null;
  }

  if (!cloned?.isObject3D) {
    const fallback = scene.clone(true) as Group;
    cloned = fallback?.isObject3D ? fallback : null;
  }

  if (!cloned?.isObject3D) {
    const root = new Group();
    scene.traverse((node) => {
      if (node instanceof Mesh) {
        const mesh = node.clone();
        if (mesh.isMesh) root.add(mesh);
      }
    });
    cloned = root;
  }

  smoothClonedMeshes(cloned);
  return cloned;
}
