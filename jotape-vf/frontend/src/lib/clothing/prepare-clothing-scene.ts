import { Group, Material, Mesh, MeshStandardMaterial, Object3D } from "three";

import { getGltfScene, type GltfLike } from "@/lib/clothing/gltf-scene";
import { cloneGltfScene } from "@/lib/virtual-fitting/clone-gltf-scene";
import { createFabricMaterial } from "@/lib/virtual-fitting/avatar-materials";

function materialHasMaps(mat: Material): boolean {
  if (!(mat instanceof MeshStandardMaterial)) return false;
  return Boolean(mat.map || mat.normalMap || mat.roughnessMap);
}

function applyFabricToMesh(mesh: Mesh, fallbackColor: string): void {
  const geo = mesh.geometry;
  if (geo) {
    mesh.geometry = geo.clone();
    mesh.geometry.computeVertexNormals();
  }

  const prev = mesh.material;
  const materials = Array.isArray(prev) ? prev : [prev];
  const keepGlb = materials.some((m) => m && materialHasMaps(m as Material));

  if (!keepGlb) {
    if (Array.isArray(prev)) prev.forEach((m) => m?.dispose());
    else prev?.dispose();
    mesh.material = createFabricMaterial(fallbackColor);
  } else {
    const clonedMats = materials.map((m) => {
      if (!m) return m;
      const c = m.clone();
      if (c instanceof MeshStandardMaterial) {
        c.wireframe = false;
        c.flatShading = false;
        c.side = 2;
        c.depthWrite = true;
        c.needsUpdate = true;
      }
      return c;
    });
    mesh.material = Array.isArray(prev) ? clonedMats : clonedMats[0]!;
  }

  mesh.visible = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
}

/**
 * Clona el GLB completo (geometrías propias, no muta caché useGLTF).
 */
export function prepareClothingScene(
  gltf: GltfLike | Object3D | null | undefined,
  fallbackColor = "#f2f2f2",
): Group {
  const source =
    gltf != null && "isObject3D" in gltf && gltf.isObject3D
      ? (gltf as Object3D)
      : getGltfScene(gltf as GltfLike);

  if (!source?.traverse) return new Group();

  const root = cloneGltfScene(source as Group);
  const toRemove: Object3D[] = [];

  root.traverse((node) => {
    if (/camera|light/i.test(node.type) || /camera|light/i.test(node.name)) {
      toRemove.push(node);
      return;
    }
    if (!(node instanceof Mesh)) return;
    applyFabricToMesh(node, fallbackColor);
  });

  for (const node of toRemove) {
    node.parent?.remove(node);
  }

  if (root.children.length === 0) {
    const meshes: Mesh[] = [];
    source.traverse((node) => {
      if (/camera|light/i.test(node.type) || /camera|light/i.test(node.name)) return;
      if (node instanceof Mesh) meshes.push(node);
    });
    for (const src of meshes) {
      const mesh = src.clone();
      if (!mesh?.isMesh) continue;
      applyFabricToMesh(mesh, fallbackColor);
      root.add(mesh);
    }
  }

  return root;
}
