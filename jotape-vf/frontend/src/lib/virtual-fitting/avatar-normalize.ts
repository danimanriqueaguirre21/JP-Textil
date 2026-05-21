import { Box3, Group, Mesh, Vector3 } from "three";

import { getAvatarModelConfig } from "@/lib/virtual-fitting/avatar-models";
import {
  GARMENT_ROOT_NAME,
  GARMENT_SHORTS_ROOT,
  GARMENT_TSHIRT_ROOT,
} from "@/lib/virtual-fitting/garment-glb";

const GARMENT_ROOTS = [GARMENT_TSHIRT_ROOT, GARMENT_SHORTS_ROOT, GARMENT_ROOT_NAME];

function setGarmentsVisible(root: Group, visible: boolean): void {
  for (const name of GARMENT_ROOTS) {
    const node = root.getObjectByName(name);
    if (node) node.visible = visible;
  }
}
import type { AvatarGender } from "@/types/virtual-fitting";

const _point = new Vector3();

/** Bounding box del cuerpo sin hijos (p. ej. prenda parentada al body mesh). */
export function measureBodyMeshBox(bodyMesh: Mesh): Box3 {
  const geometry = bodyMesh.geometry;
  geometry.computeBoundingBox();
  const local = geometry.boundingBox;
  if (!local) return new Box3();

  const box = new Box3();
  bodyMesh.updateWorldMatrix(true, false);

  const min = local.min;
  const max = local.max;
  const corners = [
    new Vector3(min.x, min.y, min.z),
    new Vector3(max.x, min.y, min.z),
    new Vector3(min.x, max.y, min.z),
    new Vector3(max.x, max.y, min.z),
    new Vector3(min.x, min.y, max.z),
    new Vector3(max.x, min.y, max.z),
    new Vector3(min.x, max.y, max.z),
    new Vector3(max.x, max.y, max.z),
  ];

  for (const corner of corners) {
    _point.copy(corner).applyMatrix4(bodyMesh.matrixWorld);
    box.expandByPoint(_point);
  }

  return box;
}

/**
 * Escala y centra el avatar usando solo la geometría del cuerpo (excluye prenda GLB).
 */
export function normalizeAvatarGroup(
  root: Group,
  bodyMesh: Mesh | null,
  gender: AvatarGender,
  heightScale: number,
): void {
  const config = getAvatarModelConfig(gender);
  root.rotation.set(0, config.rotationY, 0);
  root.updateMatrixWorld(true);

  setGarmentsVisible(root, false);

  const box =
    bodyMesh != null
      ? measureBodyMeshBox(bodyMesh)
      : new Box3().setFromObject(root);

  setGarmentsVisible(root, true);

  const size = box.getSize(new Vector3());
  if (size.y < 0.001) return;

  const uniform = (config.targetHeight * heightScale) / size.y;
  root.scale.setScalar(uniform);
  root.updateMatrixWorld(true);

  setGarmentsVisible(root, false);

  const fitted =
    bodyMesh != null
      ? measureBodyMeshBox(bodyMesh)
      : new Box3().setFromObject(root);

  setGarmentsVisible(root, true);

  const center = fitted.getCenter(new Vector3());
  root.position.set(
    -center.x + config.positionOffset[0],
    -fitted.min.y + config.positionOffset[1],
    -center.z + config.positionOffset[2],
  );
}
