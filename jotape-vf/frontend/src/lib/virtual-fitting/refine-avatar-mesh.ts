import { Group, Material, Mesh, MeshStandardMaterial } from "three";

import { applySolidMaterialFlags } from "@/lib/virtual-fitting/avatar-materials";
import { isAvatarClothingMesh } from "@/lib/virtual-fitting/avatar-mesh-utils";
import {
  countGeometryTriangles,
  subdivideBufferGeometry,
} from "@/lib/virtual-fitting/mesh-subdivide";

const GARMENT_NODE = /vf-garment|tshirt|shorts/i;

/** Refina geometría del GLB: más polígonos + normales suaves (flatShading siempre off). */
export function refineAvatarRoot(root: Group): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const name = (node.name || "").toLowerCase();
    if (name.includes("eye")) return;
    if (isAvatarClothingMesh(name) && !GARMENT_NODE.test(name)) {
      node.visible = false;
      return;
    }

    if (
      GARMENT_NODE.test(name) ||
      node.parent?.name?.startsWith("vf-garment")
    ) {
      node.geometry.computeVertexNormals();
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const mat of mats) {
        if (!mat) continue;
        if ("flatShading" in mat) mat.flatShading = false;
        applySolidMaterialFlags(mat as Material);
        if (mat instanceof MeshStandardMaterial) mat.wireframe = false;
      }
      return;
    }

    const tris = countGeometryTriangles(node.geometry);
    const levels = tris < 6_000 ? 2 : 1;
    const refined = subdivideBufferGeometry(node.geometry, {
      levels,
      maxTriangles: 100_000,
    });

    node.geometry.dispose();
    node.geometry = refined;

    const mats = Array.isArray(node.material) ? node.material : [node.material];
    for (const mat of mats) {
      if (!mat) continue;
      if ("flatShading" in mat) mat.flatShading = false;
      applySolidMaterialFlags(mat as Material);
    }
  });
}
