"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { Group, Material, Mesh, MeshStandardMaterial } from "three";

import { AvatarCameraFit } from "@/components/virtual-fitting/3d/avatar-camera-fit";

import {
  AVATAR_GLB_PATHS,
  buildOutfitRig,
} from "@/lib/clothing/build-outfit-rig";
import {
  ALL_CLOTHING_GLBS,
  getClothingGlbUrl,
} from "@/lib/clothing/clothing-paths";
import { applySolidMaterialFlags } from "@/lib/virtual-fitting/avatar-materials";
import { disposeObject3D } from "@/lib/virtual-fitting/dispose-object3d";
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

export function FittingLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#b8b8b8", 0.65]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.6} />
      <directionalLight position={[-2.2, 2.8, 2]} intensity={0.5} />
      <directionalLight position={[0, 1.2, -3]} intensity={0.35} />
    </>
  );
}

/**
 * Avatar GLB + ropa GLB del mismo género (male/female).
 */
export function GltfAvatar({
  gender,
  heightScale = 1,
  garmentScale = 1,
  showGarment = true,
  onReady,
  ...props
}: Props) {
  const rigRef = useRef<Group>(null);
  const bodyMeshRef = useRef<Mesh | null>(null);
  const mountedRef = useRef<Group | null>(null);
  const [cameraTarget, setCameraTarget] = useState<Group | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const avatar = useGLTF(AVATAR_GLB_PATHS[gender]);
  const tshirt = useGLTF(getClothingGlbUrl(gender, "tshirt"));
  const shorts = useGLTF(getClothingGlbUrl(gender, "shorts"));

  useLayoutEffect(() => {
    const wrapper = rigRef.current;
    if (!wrapper) return;

    const avatarScene = avatar.scene;
    if (!avatarScene?.traverse) return;

    if (mountedRef.current) {
      wrapper.remove(mountedRef.current);
      disposeObject3D(mountedRef.current);
      mountedRef.current = null;
    }

    const { rig, bodyMesh } = buildOutfitRig({
      gender,
      avatarScene,
      tshirtGltf: tshirt,
      shortsGltf: shorts,
      heightScale,
      garmentScale,
      showGarment,
      avatarAnimations: avatar.animations,
    });

    disableWireframeOnMaterials(rig);
    wrapper.add(rig);
    mountedRef.current = rig;
    bodyMeshRef.current = bodyMesh;
    rig.updateMatrixWorld(true);
    setCameraTarget(rig);

    onReadyRef.current?.({ model: wrapper, bodyMesh: bodyMeshRef.current });

    return () => {
      if (mountedRef.current && wrapper) {
        wrapper.remove(mountedRef.current);
        disposeObject3D(mountedRef.current);
        mountedRef.current = null;
      }
      setCameraTarget(null);
    };
  }, [avatar, tshirt, shorts, gender, heightScale, garmentScale, showGarment]);

  return (
    <>
      <AvatarCameraFit
        root={cameraTarget}
        gender={gender}
        heightScale={heightScale}
      />
      <group ref={rigRef} {...props} />
    </>
  );
}

useGLTF.preload(AVATAR_GLB_PATHS.male);
useGLTF.preload(AVATAR_GLB_PATHS.female);
for (const url of ALL_CLOTHING_GLBS) {
  useGLTF.preload(url);
}
