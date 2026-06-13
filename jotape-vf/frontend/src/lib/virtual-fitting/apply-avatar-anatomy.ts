import { Bone, Object3D } from "three";

import {
  computeAvatarAnatomyScales,
  logAnatomyScalesDebug,
  type AvatarAnatomyScales,
} from "@/lib/virtual-fitting/avatar-anatomy-scales";
import { updateSkinnedMeshes } from "@/lib/virtual-fitting/avatar-scene-utils";
import type { AvatarZoneScales } from "@/types/avatar-calibration";

function boneName(name: string): string {
  return name.toLowerCase();
}

function shouldSkip(name: string): boolean {
  return (
    /head|neck|eye|jaw|teeth|tongue|finger|toe|thumb|index|mid|ring|pinky|facial|tear|spine|waist|ribs|hip|pelvis|clavicle|sharebone/i.test(
      name,
    )
  );
}

/** Solo muslo principal (un hueso por pierna, evita herencia ×2 con pantorrilla). */
function isUpperLeg(name: string): boolean {
  return /thigh/.test(name) && !/twist|share|toe|foot|calf/.test(name);
}

/** Solo brazo superior (un hueso por brazo). */
function isUpperArm(name: string): boolean {
  return /upperarm/.test(name) && !/twist|share|finger|forearm/.test(name);
}

/**
 * Ajuste fino en extremidades. NO toca neck, head, spine ni escala ancho en huesos.
 * La altura principal va en avatar.scale (normalizeAvatarGroup).
 */
export function applyAvatarAnatomy(
  root: Object3D,
  heightScale: number,
  widthScale = 1,
  depthScale = 1,
  _zoneScales?: AvatarZoneScales,
): AvatarAnatomyScales {
  const scales = computeAvatarAnatomyScales(
    heightScale,
    widthScale,
    depthScale,
    _zoneScales,
  );

  root.traverse((node) => {
    if (!(node instanceof Bone)) return;
    const name = boneName(node.name);
    if (shouldSkip(name)) return;

    if (isUpperLeg(name)) {
      node.scale.y *= scales.legScale;
      return;
    }
    if (isUpperArm(name)) {
      node.scale.y *= scales.armScale;
    }
  });

  updateSkinnedMeshes(root);
  logAnatomyScalesDebug(scales);
  return scales;
}
