import { Box3, Group, Mesh, Object3D, Vector3 } from "three";

import {
  getClothingAlignMode,
  getClothingOffset,
  type ClothingSlot,
} from "@/lib/clothing/clothing-offsets";
import {
  getBodyRegionSlice,
  getBodyRegionYRange,
} from "@/lib/virtual-fitting/body-mesh";
import {
  garmentBodyRegion,
  garmentFitProfile,
} from "@/lib/virtual-fitting/garment-models";
import type { AvatarGender } from "@/types/virtual-fitting";

const SAME_SPACE_VERTEX_MIN = 800;

const _box = new Box3();
const _size = new Vector3();
const _center = new Vector3();

function countVertices(root: Object3D): number {
  let n = 0;
  root.traverse((node) => {
    if (!(node instanceof Mesh) || !node.geometry) return;
    const pos = node.geometry.getAttribute("position");
    if (pos) n += pos.count;
  });
  return n;
}

export function isSameSpaceGarment(garment: Object3D): boolean {
  return countVertices(garment) >= SAME_SPACE_VERTEX_MIN;
}

export function garmentMatchesAvatarGender(
  garmentSource: AvatarGender,
  avatarGender: AvatarGender,
): boolean {
  return garmentSource === avatarGender;
}

function measureGarmentBox(garment: Object3D): { size: Vector3; center: Vector3 } {
  garment.position.set(0, 0, 0);
  garment.rotation.set(0, 0, 0);
  garment.scale.set(1, 1, 1);
  garment.updateMatrixWorld(true);
  _box.setFromObject(garment);
  _box.getSize(_size);
  _box.getCenter(_center);
  return { size: _size.clone(), center: _center.clone() };
}

function alignExportSpace(
  garment: Object3D,
  gender: AvatarGender,
  slot: ClothingSlot,
): void {
  const user = getClothingOffset(gender, slot);
  garment.position.set(
    user.position[0],
    user.position[1],
    user.position[2],
  );
  garment.scale.set(user.scale[0], user.scale[1], user.scale[2]);
}

/** Alinea al centro del torso (corrige polo/short subidos o bajados). */
function alignTorsoAnchor(
  garment: Object3D,
  bodyMesh: Mesh,
  gender: AvatarGender,
  slot: ClothingSlot,
): void {
  const region = garmentBodyRegion(gender, slot);
  const target = getBodyRegionSlice(bodyMesh.geometry, region);
  _box.setFromObject(garment);
  _box.getCenter(_center);

  const user = getClothingOffset(gender, slot);
  garment.position.set(
    target.center.x - _center.x + user.position[0],
    target.center.y - _center.y + user.position[1],
    target.center.z - _center.z + user.position[2],
  );
  garment.scale.set(user.scale[0], user.scale[1], user.scale[2]);
}

/** Borde superior de la prenda en hombros (polo) o cintura (short). */
function alignTopAnchor(
  garment: Object3D,
  bodyMesh: Mesh,
  gender: AvatarGender,
  slot: ClothingSlot,
): void {
  const region = garmentBodyRegion(gender, slot);
  const yRange = getBodyRegionYRange(bodyMesh.geometry, region);
  _box.setFromObject(garment);
  _box.getCenter(_center);

  const user = getClothingOffset(gender, slot);
  const topInset =
    slot === "tshirt"
      ? (user.topInset ?? 0.04)
      : (user.topInset ?? 0.01);

  garment.position.set(
    yRange.centerX - _center.x + user.position[0],
    yRange.yMax - topInset - _box.max.y + user.position[1],
    yRange.centerZ - _center.z + user.position[2],
  );
  garment.scale.set(user.scale[0], user.scale[1], user.scale[2]);
}

function alignSameSpaceCenter(
  garment: Object3D,
  bodyMesh: Mesh,
  gender: AvatarGender,
  slot: ClothingSlot,
): void {
  const region = garmentBodyRegion(gender, slot);
  const target = getBodyRegionSlice(bodyMesh.geometry, region);
  _box.setFromObject(garment);
  _box.getCenter(_center);

  const user = getClothingOffset(gender, slot);
  garment.position.set(
    target.center.x - _center.x + user.position[0],
    target.center.y - _center.y + user.position[1],
    target.center.z - _center.z + user.position[2],
  );
  garment.scale.set(user.scale[0], user.scale[1], user.scale[2]);
}

function alignSameSpaceToBody(
  garment: Object3D,
  bodyMesh: Mesh,
  gender: AvatarGender,
  slot: ClothingSlot,
): void {
  garment.position.set(0, 0, 0);
  garment.rotation.set(0, 0, 0);
  garment.scale.set(1, 1, 1);

  bodyMesh.add(garment);
  garment.updateMatrixWorld(true);

  const mode = getClothingAlignMode(gender, slot);
  if (mode === "export") {
    alignExportSpace(garment, gender, slot);
    return;
  }
  if (mode === "torsoAnchor") {
    alignTorsoAnchor(garment, bodyMesh, gender, slot);
    return;
  }
  if (mode === "topAnchor") {
    alignTopAnchor(garment, bodyMesh, gender, slot);
    return;
  }
  alignSameSpaceCenter(garment, bodyMesh, gender, slot);
}

function alignByBoundingBox(
  garment: Object3D,
  bodyMesh: Mesh,
  gender: AvatarGender,
  slot: ClothingSlot,
  garmentScale: number,
): void {
  const region = garmentBodyRegion(gender, slot);
  const profile = garmentFitProfile(gender, garmentScale);
  const target = getBodyRegionSlice(bodyMesh.geometry, region);
  const { size: garmentSize } = measureGarmentBox(garment);
  const user = getClothingOffset(gender, slot);
  const ease = profile.ease * garmentScale;

  const sx =
    garmentSize.x > 1e-6
      ? ((target.size.x * ease) / garmentSize.x) * user.scale[0]
      : 1;
  const sy =
    garmentSize.y > 1e-6
      ? ((target.size.y * ease) / garmentSize.y) * user.scale[1]
      : 1;
  const sz =
    garmentSize.z > 1e-6
      ? ((target.size.z * ease) / garmentSize.z) * user.scale[2]
      : 1;

  garment.scale.set(sx, sy, sz);
  garment.updateMatrixWorld(true);
  _box.setFromObject(garment);
  _box.getCenter(_center);

  garment.position.set(
    target.center.x - _center.x + user.position[0],
    target.center.y - _center.y + user.position[1],
    target.center.z - _center.z + profile.offset + user.position[2],
  );
  garment.rotation.set(
    user.rotation[0],
    user.rotation[1],
    user.rotation[2],
  );
}

export function alignGarmentToBodyMesh(
  garment: Object3D,
  bodyMesh: Mesh | null,
  gender: AvatarGender,
  slot: ClothingSlot,
  garmentScale = 1,
  garmentSource: AvatarGender = gender,
): void {
  const useSameSpace =
    bodyMesh != null &&
    isSameSpaceGarment(garment) &&
    garmentMatchesAvatarGender(garmentSource, gender);

  if (useSameSpace) {
    alignSameSpaceToBody(garment, bodyMesh, gender, slot);
    return;
  }
  if (bodyMesh) {
    alignByBoundingBox(garment, bodyMesh, gender, slot, garmentScale);
  }
}

export function attachAlignedOutfit(
  rig: Group,
  avatarRoot: Group,
  bodyMesh: Mesh | null,
  garments: { tshirt: Group | null; shorts: Group | null },
  gender: AvatarGender,
  garmentScale: number,
): void {
  rig.add(avatarRoot);
  attachGarmentsToBody(bodyMesh, garments, gender, garmentScale);
}

/** Monta ropa en el bodyMesh tras normalizar el avatar (coords del GLB exportado). */
export function attachGarmentsToBody(
  bodyMesh: Mesh | null,
  garments: { tshirt: Group | null; shorts: Group | null },
  gender: AvatarGender,
  garmentScale: number,
): void {
  const fallbackParent = bodyMesh ?? null;
  if (!fallbackParent) return;

  const hasMeshes = (g: Group | null) => {
    if (!g) return false;
    let ok = false;
    g.traverse((n) => {
      if (n instanceof Mesh && n.visible) ok = true;
    });
    return ok;
  };

  const tshirt = garments.tshirt;
  if (tshirt && hasMeshes(tshirt)) {
    alignGarmentToBodyMesh(
      tshirt,
      bodyMesh,
      gender,
      "tshirt",
      garmentScale,
      gender,
    );
    if (!tshirt.parent) fallbackParent.add(tshirt);
  }
  const shorts = garments.shorts;
  if (shorts && hasMeshes(shorts)) {
    alignGarmentToBodyMesh(
      shorts,
      bodyMesh,
      gender,
      "shorts",
      garmentScale,
      gender,
    );
    if (!shorts.parent) fallbackParent.add(shorts);
  }
}

