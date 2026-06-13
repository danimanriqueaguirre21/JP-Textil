import { Bone, Object3D } from "three";

import { updateSkinnedMeshes } from "@/lib/virtual-fitting/avatar-scene-utils";
import type { AnatomicalVolumeScales } from "@/types/body-volume";

function boneName(name: string): string {
  return name.toLowerCase();
}

/** Nunca escalar: cabeza, cuello, dedos, pies, huesos faciales. */
function isForbidden(name: string): boolean {
  return /head|neck|eye|jaw|teeth|tongue|finger|toe|thumb|index|mid|ring|pinky|facial|tear|sharebone|foot|calf|twist/i.test(
    name,
  );
}

/** Asigna X/Z absolutos (no multiplica) para evitar acumulación en la jerarquía. */
function setXZ(bone: Bone, x: number, z: number): void {
  bone.scale.x = x;
  bone.scale.z = z;
}

/**
 * Fallback óseo: torso y piernas con volumen; brazos/mano muy suaves.
 * Un solo hueso por cadena en extremidades para no inflar antebrazos/mano.
 */
export function applyBodyVolumeBones(
  root: Object3D,
  zones: AnatomicalVolumeScales,
): void {
  root.traverse((node) => {
    if (!(node instanceof Bone)) return;
    const name = boneName(node.name);
    if (isForbidden(name)) return;

    if (/spine01|ribs/.test(name)) {
      setXZ(node, zones.chest.x, zones.chest.z);
      return;
    }

    if (/spine02|waist/.test(name) && !/hip|thigh/.test(name)) {
      setXZ(node, zones.abdomen.x, zones.abdomen.z);
      return;
    }

    if ((/hip|pelvis/.test(name) || name === "hip") && !/thigh/.test(name)) {
      setXZ(node, zones.hips.x, zones.hips.z);
      return;
    }

    if (/thigh/.test(name)) {
      setXZ(node, zones.thigh.x, zones.thigh.z);
      return;
    }

    if (/upperarm/.test(name) && !/forearm|hand/.test(name)) {
      setXZ(node, zones.upperArm.x, zones.upperArm.z);
      return;
    }

    if (/forearm/.test(name) && !/hand/.test(name)) {
      setXZ(node, zones.foreArm.x, zones.foreArm.z);
      return;
    }

    if (/^hand$|_hand$|hand_l|hand_r|wrist/.test(name) && !/finger/.test(name)) {
      setXZ(node, zones.hand.x, zones.hand.z);
    }
  });

  updateSkinnedMeshes(root);
}
