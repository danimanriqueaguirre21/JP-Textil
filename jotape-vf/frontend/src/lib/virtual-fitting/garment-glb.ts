import {
  Box3,
  CapsuleGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";

import { getBodyRegionSlice } from "@/lib/virtual-fitting/body-mesh";
import type { AvatarGender } from "@/types/virtual-fitting";
import {
  DEFAULT_OUTFIT_COLORS,
  garmentBodyRegion,
  type GarmentBodyRegion,
  type GarmentFitProfile,
} from "@/lib/virtual-fitting/garment-models";
import { createRoundedBoxGeometry } from "@/lib/virtual-fitting/rounded-box-geometry";

export const GARMENT_ROOT_NAME = "vf-garment";
export const GARMENT_TSHIRT_ROOT = "vf-garment-tshirt";
export const GARMENT_SHORTS_ROOT = "vf-garment-shorts";

const _gBox = new Box3();
const _gSize = new Vector3();
const _gCenter = new Vector3();

export function createGarmentMeshMaterial(color: string | number): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: typeof color === "string" ? new Color(color) : color,
    roughness: 0.88,
    metalness: 0,
    wireframe: false,
    flatShading: false,
  });
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -2;
  mat.polygonOffsetUnits = -2;
  return mat;
}

function createPlaceholderGarmentGeometry(rootName: string): CapsuleGeometry | ReturnType<typeof createRoundedBoxGeometry> {
  if (rootName === GARMENT_TSHIRT_ROOT) {
    return new CapsuleGeometry(0.42, 0.4, 8, 16);
  }
  return createRoundedBoxGeometry(1, 0.72, 1, 0.16);
}

/** Encaja la prenda al volumen del torso/cadera (escala por eje). */
export function fitGarmentRootToBody(
  bodyMesh: Mesh,
  garmentRoot: Group,
  region: GarmentBodyRegion,
  profile: GarmentFitProfile,
): void {
  const target = getBodyRegionSlice(bodyMesh.geometry, region);
  const ease = profile.ease;

  garmentRoot.position.set(0, 0, 0);
  garmentRoot.rotation.set(0, 0, 0);
  garmentRoot.scale.set(1, 1, 1);
  garmentRoot.updateMatrixWorld(true);

  _gBox.setFromObject(garmentRoot);
  _gBox.getSize(_gSize);
  _gBox.getCenter(_gCenter);

  if (_gSize.x < 1e-6 || _gSize.y < 1e-6 || _gSize.z < 1e-6) return;

  garmentRoot.scale.set(
    (target.size.x * ease) / _gSize.x,
    (target.size.y * ease) / _gSize.y,
    (target.size.z * ease) / _gSize.z,
  );
  garmentRoot.updateMatrixWorld(true);

  _gBox.setFromObject(garmentRoot);
  _gBox.getCenter(_gCenter);

  garmentRoot.position.set(
    target.center.x - _gCenter.x,
    target.center.y - _gCenter.y,
    target.center.z - _gCenter.z + profile.offset,
  );
}

/** Prenda placeholder (cápsula + caja redondeada) hasta tener GLB de tela real. */
function buildSoftGarmentRoot(
  bodyMesh: Mesh,
  region: GarmentBodyRegion,
  color: string,
  profile: GarmentFitProfile,
): Group {
  const root = new Group();
  root.name = region.rootName;

  const mesh = new Mesh(
    createPlaceholderGarmentGeometry(region.rootName),
    createGarmentMeshMaterial(color),
  );
  mesh.name = `${region.rootName}_mesh`;
  root.add(mesh);
  fitGarmentRootToBody(bodyMesh, root, region, profile);
  return root;
}

export function mergeGarmentToAvatarRoot(
  avatarRoot: Group,
  bodyMesh: Mesh,
  options: {
    region: GarmentBodyRegion;
    color: string;
    profile: GarmentFitProfile;
  },
): Group {
  removeGarmentFromAvatar(avatarRoot, options.region.rootName);

  const root = buildSoftGarmentRoot(
    bodyMesh,
    options.region,
    options.color,
    options.profile,
  );

  bodyMesh.add(root);
  return root;
}

export function mergeDefaultOutfit(
  avatarRoot: Group,
  bodyMesh: Mesh,
  options: {
    profile: GarmentFitProfile;
    gender: AvatarGender;
  },
): void {
  removeAllGarmentsFromAvatar(avatarRoot);

  mergeGarmentToAvatarRoot(avatarRoot, bodyMesh, {
    region: garmentBodyRegion(options.gender, "tshirt"),
    color: DEFAULT_OUTFIT_COLORS.tshirt,
    profile: options.profile,
  });

  mergeGarmentToAvatarRoot(avatarRoot, bodyMesh, {
    region: garmentBodyRegion(options.gender, "shorts"),
    color: DEFAULT_OUTFIT_COLORS.shorts,
    profile: options.profile,
  });
}

export function enforceGarmentSolidMaterials(root: Object3D, color: string): void {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry?.computeVertexNormals();
    const prev = child.material;
    child.material = createGarmentMeshMaterial(color);
    child.visible = true;
    if (Array.isArray(prev)) prev.forEach((m) => m.dispose());
    else if (prev) prev.dispose();
    child.castShadow = true;
    child.receiveShadow = false;
    child.renderOrder = 1;
  });
  root.visible = true;
}

export function removeGarmentFromAvatar(
  avatarRoot: Object3D,
  rootName: string,
): void {
  const existing = avatarRoot.getObjectByName(rootName);
  if (!existing) return;
  existing.parent?.remove(existing);
  existing.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.geometry.dispose();
    const mat = node.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose();
  });
}

export function removeAllGarmentsFromAvatar(avatarRoot: Object3D): void {
  removeGarmentFromAvatar(avatarRoot, GARMENT_TSHIRT_ROOT);
  removeGarmentFromAvatar(avatarRoot, GARMENT_SHORTS_ROOT);
  removeGarmentFromAvatar(avatarRoot, GARMENT_ROOT_NAME);
}
