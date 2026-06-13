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

/**
 * @deprecated Usar applyAvatarAnatomy (proporciones por hueso).
 */
export function applyAvatarLimbLength(
  root: Object3D,
  zones: AvatarZoneScales,
  heightScale = 1,
): void {
  const armLen = zones.arm;
  const legLen = zones.leg;

  root.traverse((node) => {
    if (!(node instanceof Bone)) return;
    const name = boneName(node.name);

    if (isLimbArm(name)) {
      node.scale.y *= armLen;
      return;
    }
    if (isLimbLeg(name)) {
      node.scale.y *= legLen;
    }
  });

  updateSkinnedMeshes(root);
}
