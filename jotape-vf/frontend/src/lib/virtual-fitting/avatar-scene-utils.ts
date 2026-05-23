import { Box3, Mesh, Object3D, SkinnedMesh, Vector3 } from "three";

const _point = new Vector3();

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
    if (!(node instanceof Mesh)) return;
    node.morphTargetDictionary = {};
    node.morphTargetInfluences = [];
    node.geometry.morphAttributes = {};
    if ("morphTargetsRelative" in node.geometry) {
      node.geometry.morphTargetsRelative = false;
    }
  });
}

export function updateSkinnedMeshes(root: Object3D): void {
  root.traverse((node) => {
    if (node instanceof SkinnedMesh) {
      node.skeleton?.update();
      node.computeBoundingSphere();
    }
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
