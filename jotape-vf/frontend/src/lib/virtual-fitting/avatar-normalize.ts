import { Box3, Group, Mesh, Vector3 } from "three";

import { getAvatarModelConfig } from "@/lib/virtual-fitting/avatar-models";
import { measureAvatarWorldBox } from "@/lib/virtual-fitting/avatar-scene-utils";
import type { AvatarGender } from "@/types/virtual-fitting";

const _point = new Vector3();

/** Bounding box del cuerpo (ignora hijos que no son geometría del basemesh). */
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
 * Escala y centra el grupo (avatar + ropa GLB hermanos) usando solo el basemesh.
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

  const box = measureAvatarWorldBox(root);
  const size = box.getSize(new Vector3());
  const height = size.y > 0.001 ? size.y : 0;
  if (height < 0.001) return;

  const uniform = (config.targetHeight * heightScale) / height;
  root.scale.setScalar(uniform);
  root.updateMatrixWorld(true);

  const fitted = measureAvatarWorldBox(root);

  const center = fitted.getCenter(new Vector3());
  root.position.set(
    -center.x + config.positionOffset[0],
    -fitted.min.y + config.positionOffset[1],
    -center.z + config.positionOffset[2],
  );
}
