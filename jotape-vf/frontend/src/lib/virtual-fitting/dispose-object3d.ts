import { Material, Mesh, Object3D } from "three";

/** Libera geometrías/materiales de un subárbol (no el caché global de useGLTF). */
export function disposeObject3D(root: Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.geometry?.dispose();
    const mat = node.material;
    if (Array.isArray(mat)) mat.forEach((m) => m?.dispose());
    else mat?.dispose();
  });
}
