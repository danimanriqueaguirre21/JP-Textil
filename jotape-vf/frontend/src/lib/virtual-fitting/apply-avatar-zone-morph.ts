import { Bone, Object3D } from "three";

import { updateSkinnedMeshes } from "@/lib/virtual-fitting/avatar-scene-utils";
import type { AvatarZoneScales } from "@/types/avatar-calibration";

function boneName(name: string): string {
  return name.toLowerCase();
}

function isLimbArm(name: string): boolean {
  return (
    /upperarm|forearm/.test(name) &&
    !/twist|share|finger|toe|thumb|index|mid|ring|pinky/.test(name)
  );
}

function isLimbLeg(name: string): boolean {
  return (
    (/thigh|calf/.test(name) || /_leg$/.test(name)) &&
    !/twist|share|toe|foot/.test(name)
  );
}

function isClavicle(name: string): boolean {
  return /clavicle/.test(name);
}

function isChestSpine(name: string): boolean {
  return /spine01|ribs/.test(name);
}

function isWaistSpine(name: string): boolean {
  return /spine02|waist/.test(name);
}

function isPelvis(name: string): boolean {
  return /hip|pelvis/.test(name) && !/thigh/.test(name);
}

function shouldSkip(name: string): boolean {
  return (
    /head|eye|jaw|teeth|tongue|hand|foot|toe|finger|facial|breast|tear|body$/i.test(
      name,
    ) || name.includes("sharebone")
  );
}

/**
 * @deprecated Usar applyAvatarBodyMorphs + applyAvatarLimbLength.
 * Ajuste por escala de huesos (ensancha todo el torso de forma poco realista).
 */
export function applyAvatarZoneMorph(
  root: Object3D,
  zones: AvatarZoneScales,
): void {
  const chestWaist = (zones.chest + zones.waist) / 2;

  root.traverse((node) => {
    if (!(node instanceof Bone)) return;

    const name = boneName(node.name);
    if (shouldSkip(name)) return;

    if (isLimbArm(name)) {
      node.scale.y *= zones.arm;
      node.scale.x *= (zones.shoulder + zones.chest) / 2;
      node.scale.z *= zones.depth;
      return;
    }

    if (isLimbLeg(name)) {
      node.scale.y *= zones.leg;
      const thick = (zones.hip + zones.leg) / 2;
      node.scale.x *= thick;
      node.scale.z *= thick * zones.depth;
      return;
    }

    if (isClavicle(name)) {
      node.scale.x *= zones.shoulder;
      node.scale.z *= zones.depth;
      return;
    }

    if (isChestSpine(name)) {
      node.scale.x *= zones.chest;
      node.scale.z *= zones.depth;
      return;
    }

    if (isWaistSpine(name)) {
      node.scale.x *= chestWaist;
      node.scale.z *= zones.depth * ((zones.waist + zones.depth) / 2);
      return;
    }

    if (isPelvis(name)) {
      node.scale.x *= zones.hip;
      node.scale.z *= zones.depth;
    }
  });

  updateSkinnedMeshes(root);
}
