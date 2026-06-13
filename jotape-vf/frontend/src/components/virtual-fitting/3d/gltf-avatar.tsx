"use client";

import { Html } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Material, Mesh, MeshStandardMaterial } from "three";

import { AvatarCameraFit } from "@/components/virtual-fitting/3d/avatar-camera-fit";

import {
  AVATAR_GLB_PATHS,
  buildOutfitRig,
} from "@/lib/clothing/build-outfit-rig";
import { getClothingGlbUrl } from "@/lib/clothing/clothing-paths";
import { applySolidMaterialFlags } from "@/lib/virtual-fitting/avatar-materials";
import { shouldLoadGarmentGltfs } from "@/lib/virtual-fitting/avatar-performance";
import { disposeObject3D } from "@/lib/virtual-fitting/dispose-object3d";
import type { AvatarCalibration } from "@/types/avatar-calibration";
import type { AvatarZoneScales } from "@/types/avatar-calibration";
import type { AvatarGender } from "@/types/virtual-fitting";
import type { GltfLike } from "@/lib/clothing/gltf-scene";

type GroupProps = ThreeElements["group"];

export type GltfAvatarResult = {
  model: Group;
  bodyMesh: Mesh | null;
};

type Props = GroupProps & {
  gender: AvatarGender;
  heightScale?: number;
  widthScale?: number;
  depthScale?: number;
  zoneScales?: AvatarZoneScales;
  /** Calibración con escalas proporcionales (escaneo front/side). */
  avatarCalibration?: AvatarCalibration;
  proportionsScale?: { x?: number; z?: number };
  garmentScale?: number;
  showGarment?: boolean;
  onReady?: (result: GltfAvatarResult) => void;
};

const EMPTY_GLTF: GltfLike = { scene: new Group(), animations: [] };

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

function RigBuildingOverlay({ label }: { label: string }) {
  return (
    <Html center>
      <p className="max-w-xs rounded-2xl border border-white/60 bg-white/90 px-4 py-2 text-center text-sm text-zinc-600 shadow-lg backdrop-blur">
        {label}
      </p>
    </Html>
  );
}

function useMountOutfitRig(
  props: Props,
  avatarGltf: GltfLike,
  tshirtGltf: GltfLike,
  shortsGltf: GltfLike,
) {
  const rigRef = useRef<Group>(null);
  const bodyMeshRef = useRef<Mesh | null>(null);
  const mountedRef = useRef<Group | null>(null);
  const [cameraTarget, setCameraTarget] = useState<Group | null>(null);
  const [rigStatus, setRigStatus] = useState<"idle" | "building" | "ready">("idle");
  const onReadyRef = useRef(props.onReady);
  onReadyRef.current = props.onReady;

  const {
    gender,
    heightScale = 1,
    widthScale = 1,
    depthScale = 1,
    zoneScales,
    avatarCalibration,
    proportionsScale,
    garmentScale = 1,
    showGarment = true,
  } = props;

  useEffect(() => {
    const wrapper = rigRef.current;
    if (!wrapper || !avatarGltf.scene?.traverse) return;

    let cancelled = false;

    const mountRig = () => {
      if (cancelled || !rigRef.current) return;

      if (mountedRef.current) {
        wrapper.remove(mountedRef.current);
        disposeObject3D(mountedRef.current);
        mountedRef.current = null;
      }

      setRigStatus("building");

      const { rig, bodyMesh } = buildOutfitRig({
        gender,
        avatarScene: avatarGltf.scene,
        tshirtGltf,
        shortsGltf,
        heightScale,
        widthScale,
        depthScale,
        zoneScales,
        avatarCalibration,
        proportionsScale,
        garmentScale,
        showGarment,
        avatarAnimations: avatarGltf.animations,
      });

      if (cancelled) {
        disposeObject3D(rig);
        return;
      }

      disableWireframeOnMaterials(rig);
      wrapper.add(rig);
      mountedRef.current = rig;
      bodyMeshRef.current = bodyMesh;
      rig.updateMatrixWorld(true);
      setCameraTarget(rig);
      setRigStatus("ready");
      onReadyRef.current?.({ model: wrapper, bodyMesh: bodyMeshRef.current });
    };

    setRigStatus("idle");
    const idleId = requestIdleCallback(mountRig, { timeout: 1500 });
    const fallbackId = window.setTimeout(mountRig, 80);

    return () => {
      cancelled = true;
      cancelIdleCallback(idleId);
      window.clearTimeout(fallbackId);
      if (mountedRef.current && rigRef.current) {
        rigRef.current.remove(mountedRef.current);
        disposeObject3D(mountedRef.current);
        mountedRef.current = null;
      }
      setCameraTarget(null);
      setRigStatus("idle");
    };
  }, [
    avatarGltf,
    tshirtGltf,
    shortsGltf,
    gender,
    heightScale,
    widthScale,
    depthScale,
    zoneScales,
    avatarCalibration,
    proportionsScale,
    garmentScale,
    showGarment,
  ]);

  return { rigRef, cameraTarget, rigStatus, heightScale, gender };
}

function GltfAvatarBodyOnly(props: Props) {
  useEffect(() => {
    useGLTF.preload(AVATAR_GLB_PATHS[props.gender]);
  }, [props.gender]);

  const avatar = useGLTF(AVATAR_GLB_PATHS[props.gender]);
  const { rigRef, cameraTarget, rigStatus, heightScale, gender } = useMountOutfitRig(
    { ...props, showGarment: false },
    avatar,
    EMPTY_GLTF,
    EMPTY_GLTF,
  );

  return (
    <>
      {rigStatus === "building" && (
        <RigBuildingOverlay label="Preparando avatar…" />
      )}
      <AvatarCameraFit root={cameraTarget} gender={gender} heightScale={heightScale} />
      <group ref={rigRef} {...props} />
    </>
  );
}

function GltfAvatarWithGarments(props: Props) {
  const { gender } = props;

  useEffect(() => {
    useGLTF.preload(AVATAR_GLB_PATHS[gender]);
    useGLTF.preload(getClothingGlbUrl(gender, "tshirt"));
    useGLTF.preload(getClothingGlbUrl(gender, "shorts"));
  }, [gender]);

  const avatar = useGLTF(AVATAR_GLB_PATHS[gender]);
  const tshirt = useGLTF(getClothingGlbUrl(gender, "tshirt"));
  const shorts = useGLTF(getClothingGlbUrl(gender, "shorts"));

  const { rigRef, cameraTarget, rigStatus, heightScale } = useMountOutfitRig(
    props,
    avatar,
    tshirt,
    shorts,
  );

  return (
    <>
      {rigStatus === "building" && (
        <RigBuildingOverlay label="Preparando avatar y ropa…" />
      )}
      <AvatarCameraFit
        root={cameraTarget}
        gender={gender}
        heightScale={heightScale}
      />
      <group ref={rigRef} {...props} />
    </>
  );
}

/**
 * Avatar GLB + ropa opcional. En dev solo cuerpo (sin GLB de ropa pesados).
 */
export function GltfAvatar(props: Props) {
  const loadGarments =
    props.showGarment !== false && shouldLoadGarmentGltfs();

  if (loadGarments) {
    return <GltfAvatarWithGarments {...props} />;
  }
  return <GltfAvatarBodyOnly {...props} />;
}

useGLTF.preload(AVATAR_GLB_PATHS.male);
useGLTF.preload(AVATAR_GLB_PATHS.female);
