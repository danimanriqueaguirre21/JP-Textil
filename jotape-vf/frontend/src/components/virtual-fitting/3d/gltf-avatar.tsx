"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Group, Material, Mesh, MeshStandardMaterial } from "three";

import { AVATAR_MODEL_URL } from "@/lib/virtual-fitting/avatar-models";
import { normalizeAvatarGroup } from "@/lib/virtual-fitting/avatar-normalize";
import {
  applySolidMaterialFlags,
  createHairMaterial,
  createSkinMaterial,
} from "@/lib/virtual-fitting/avatar-materials";
import {
  applyBodyMaterial,
  isAvatarClothingMesh,
} from "@/lib/virtual-fitting/avatar-mesh-utils";
import { findMainBodyMesh } from "@/lib/virtual-fitting/body-mesh";
import {
  GARMENT_SHORTS_ROOT,
  GARMENT_TSHIRT_ROOT,
  enforceGarmentSolidMaterials,
  mergeDefaultOutfit,
  removeAllGarmentsFromAvatar,
} from "@/lib/virtual-fitting/garment-glb";
import {
  DEFAULT_OUTFIT_COLORS,
  garmentFitProfile,
} from "@/lib/virtual-fitting/garment-models";
import { refineAvatarRoot } from "@/lib/virtual-fitting/refine-avatar-mesh";
import type { AvatarGender } from "@/types/virtual-fitting";

type GroupProps = ThreeElements["group"];

export type GltfAvatarResult = {
  model: Group;
  bodyMesh: Mesh | null;
};

type Props = GroupProps & {
  gender: AvatarGender;
  heightScale?: number;
  garmentScale?: number;
  showGarment?: boolean;
  onReady?: (result: GltfAvatarResult) => void;
};

function disableWireframeOnMaterials(root: Group): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];
    for (const mat of materials) {
      if (!mat) continue;
      applySolidMaterialFlags(mat as Material);
      if (mat instanceof MeshStandardMaterial) {
        mat.wireframe = false;
        mat.needsUpdate = true;
      }
    }
  });
}

function prepareAvatarMeshes(root: Group): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const name = (node.name || "").toLowerCase();
    if (name.includes("eye")) {
      node.visible = false;
      return;
    }
    if (isAvatarClothingMesh(name)) {
      node.visible = false;
      return;
    }
    if (
      node.parent?.name === GARMENT_TSHIRT_ROOT ||
      node.parent?.name === GARMENT_SHORTS_ROOT ||
      /vf-garment/.test(name)
    ) {
      return;
    }
    if (name.includes("hair")) {
      applyBodyMaterial(node, createHairMaterial());
      return;
    }
    applyBodyMaterial(node, createSkinMaterial());
  });
}

export function FittingLights() {
  return (
    <>
      <ambientLight intensity={2} />
      <hemisphereLight args={["#ffffff", "#aaaaaa", 1]} />
      <directionalLight
        position={[0, 3, 3]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[0, 2, -2]} intensity={1} />
    </>
  );
}

/** Avatar GLB + outfit placeholder (cápsula/caja redondeada). GLB de tela: futuro. */
export function GltfAvatar({
  gender,
  heightScale = 1,
  garmentScale = 1,
  showGarment = true,
  onReady,
  ...props
}: Props) {
  const { scene } = useGLTF(AVATAR_MODEL_URL[gender]);

  const profile = garmentFitProfile(gender, garmentScale);
  const shouldShowGarment = showGarment !== false;

  const { model, bodyMesh } = useMemo(() => {
    const clone = scene.clone(true);
    prepareAvatarMeshes(clone);

    const body = findMainBodyMesh(clone);

    refineAvatarRoot(clone);

    if (shouldShowGarment && body) {
      mergeDefaultOutfit(clone, body, { profile, gender });
    } else {
      removeAllGarmentsFromAvatar(clone);
    }

    const tshirtRoot = clone.getObjectByName(GARMENT_TSHIRT_ROOT);
    const shortsRoot = clone.getObjectByName(GARMENT_SHORTS_ROOT);
    if (tshirtRoot) {
      enforceGarmentSolidMaterials(tshirtRoot, DEFAULT_OUTFIT_COLORS.tshirt);
    }
    if (shortsRoot) {
      enforceGarmentSolidMaterials(shortsRoot, DEFAULT_OUTFIT_COLORS.shorts);
    }

    normalizeAvatarGroup(clone, body, gender, heightScale);
    disableWireframeOnMaterials(clone);

    clone.updateMatrixWorld(true);

    return { model: clone, bodyMesh: body };
  }, [scene, gender, heightScale, garmentScale, shouldShowGarment, profile]);

  useEffect(() => {
    onReady?.({ model, bodyMesh });
  }, [model, bodyMesh, onReady]);

  return <primitive object={model} castShadow receiveShadow {...props} />;
}

useGLTF.preload(AVATAR_MODEL_URL.male);
useGLTF.preload(AVATAR_MODEL_URL.female);
