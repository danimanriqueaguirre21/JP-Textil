import { Box3, Mesh, type Object3D, Vector3 } from "three";

/** Oculta prendas / accesorios embebidos en GLB de personajes (p. ej. Michelle). */
const HIDDEN_MESH =
  /cloth|clothing|outfit|dress|shirt|pant|skirt|jacket|coat|shoe|boot|sneaker|belt|hat|cap|glass|watch|jewel|button|zip|logo|michelle|stocking|legging|underwear|bra|top_|_top|bottom|shorts/i;

export function isAvatarClothingMesh(name: string): boolean {
  return HIDDEN_MESH.test(name);
}

export function applyBodyMaterial(mesh: Mesh, material: Mesh["material"]): void {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.material = material;
}

export type HeadAnchor = {
  headY: number;
  headRadius: number;
};

export function headAnchorFromObject(root: Object3D): HeadAnchor {
  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  const headRadius = Math.max(size.x, size.z) * 0.095;
  return {
    headY: box.max.y - headRadius * 0.55,
    headRadius,
  };
}
