import type { Object3D } from "three";

/** Resultado de useGLTF (drei). */
export type GltfLike = {
  scene?: Object3D;
  scenes?: Object3D[];
};

export function getGltfScene(gltf: GltfLike | null | undefined): Object3D | null {
  if (!gltf) return null;
  if (gltf.scene?.isObject3D && typeof gltf.scene.traverse === "function") {
    return gltf.scene;
  }
  const first = gltf.scenes?.[0];
  if (first?.isObject3D && typeof first.traverse === "function") {
    return first;
  }
  return null;
}
