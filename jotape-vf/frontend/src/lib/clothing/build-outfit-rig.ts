import { AnimationClip, Group, Mesh, Object3D } from "three";

import {
  attachGarmentsToBody,
  attachAlignedOutfit,
} from "@/lib/clothing/align-clothing-to-body";
import { getClothingInstance } from "@/lib/clothing/clothing-cache";
import { inflateClothingGroup } from "@/lib/clothing/inflate-clothing-group";
import { getClothingGlbUrl } from "@/lib/clothing/clothing-paths";
import type { GltfLike } from "@/lib/clothing/gltf-scene";
import { AVATAR_MODEL_URL } from "@/lib/virtual-fitting/avatar-models";
import type { AvatarCalibration } from "@/types/avatar-calibration";
import { applyProportionalCalibration } from "@/lib/virtual-fitting/apply-proportional-scales";
import {
  normalizeAvatarGroup,
  refitAvatarGround,
} from "@/lib/virtual-fitting/avatar-normalize";
import type { AvatarZoneScales } from "@/types/avatar-calibration";
import {
  isCharacterCreatorScene,
  sanitizeMorphTargets,
} from "@/lib/virtual-fitting/avatar-scene-utils";
import { getAvatarInstance } from "@/lib/virtual-fitting/avatar-rig-cache";
import type { AvatarGender } from "@/types/virtual-fitting";

function outfitHasMesh(root: Group): boolean {
  let found = false;
  root.traverse((node) => {
    if (node instanceof Mesh && node.visible) found = true;
  });
  return found;
}

export type OutfitRig = {
  rig: Group;
  bodyMesh: Mesh | null;
};

export type BuildOutfitRigInput = {
  gender: AvatarGender;
  avatarScene: Object3D;
  tshirtGltf: GltfLike;
  shortsGltf: GltfLike;
  heightScale?: number;
  widthScale?: number;
  depthScale?: number;
  /** Calibración corporal (escalas proporcionales desde escaneo). */
  avatarCalibration?: AvatarCalibration;
  /** Escalas por zona (altura / extremidades). */
  zoneScales?: AvatarZoneScales;
  /** Fallback si no hay zoneScales. */
  proportionsScale?: { x?: number; z?: number };
  garmentScale?: number;
  showGarment?: boolean;
  tshirtColor?: string;
  shortsColor?: string;
  avatarAnimations?: AnimationClip[];
};

export function buildOutfitRig(input: BuildOutfitRigInput): OutfitRig {
  const {
    gender,
    avatarScene,
    tshirtGltf,
    shortsGltf,
    heightScale = 1,
    widthScale = 1,
    depthScale = 1,
    avatarCalibration,
    zoneScales,
    proportionsScale,
    garmentScale = 1,
    showGarment = true,
    tshirtColor = "#f5f5f0",
    shortsColor = "#ebe6dc",
  } = input;

  const rig = new Group();
  const isCC = isCharacterCreatorScene(avatarScene);
  const useGarments = showGarment && !isCC;
  const { root: avatar, bodyMesh } = getAvatarInstance(avatarScene, gender, {
    refine: !isCC,
    refineLevels: gender === "male" ? 1 : 2,
    animations: input.avatarAnimations,
  });

  rig.add(avatar);
  normalizeAvatarGroup(
    rig,
    bodyMesh,
    gender,
    {
      heightScale,
      widthScale: avatarCalibration ? undefined : zoneScales ? widthScale : undefined,
      depthScale: avatarCalibration ? undefined : zoneScales ? depthScale : undefined,
    },
    avatarCalibration || zoneScales ? undefined : proportionsScale,
  );

  if (avatarCalibration) {
    applyProportionalCalibration(avatar, avatarCalibration);
    sanitizeMorphTargets(avatar);
    refitAvatarGround(rig, gender);
  } else if (zoneScales) {
    sanitizeMorphTargets(avatar);
    refitAvatarGround(rig, gender);
  }

  let tshirt: Group | null = null;
  let shorts: Group | null = null;

  if (useGarments && bodyMesh) {
    const tshirtPrepared = getClothingInstance(
      tshirtGltf,
      getClothingGlbUrl(gender, "tshirt"),
      tshirtColor,
    );
    const shortsPrepared = getClothingInstance(
      shortsGltf,
      getClothingGlbUrl(gender, "shorts"),
      shortsColor,
    );
    if (outfitHasMesh(tshirtPrepared)) {
      tshirt = tshirtPrepared;
    }
    if (outfitHasMesh(shortsPrepared)) {
      shorts = shortsPrepared;
    }
    attachGarmentsToBody(bodyMesh, { tshirt, shorts }, gender, garmentScale);
    if (tshirt) inflateClothingGroup(tshirt, gender, "tshirt");
    if (shorts) inflateClothingGroup(shorts, gender, "shorts");
  }

  return { rig, bodyMesh };
}

export const AVATAR_GLB_PATHS = AVATAR_MODEL_URL;
