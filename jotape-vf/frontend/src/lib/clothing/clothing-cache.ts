import { Group } from "three";

import type { GltfLike } from "@/lib/clothing/gltf-scene";
import { prepareClothingScene } from "@/lib/clothing/prepare-clothing-scene";

/** Instancia nueva cada vez (geometrías propias; seguro al dispose del rig). */
export function getClothingInstance(
  gltf: GltfLike,
  _url: string,
  color: string,
): Group {
  return prepareClothingScene(gltf, color);
}

export function clearClothingTemplateCache(): void {
  /* sin caché global — evita plantillas rotas tras dispose */
}
