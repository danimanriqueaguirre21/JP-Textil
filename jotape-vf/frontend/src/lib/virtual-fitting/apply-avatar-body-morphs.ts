import { Group, Mesh, Object3D } from "three";

import { findMainBodyMesh } from "@/lib/virtual-fitting/body-mesh";
import { ensureProceduralBodyMorphs } from "@/lib/virtual-fitting/build-procedural-body-morphs";
import { sanitizeMeshMorphTargets } from "@/lib/virtual-fitting/mesh-morph-utils";
import { zoneScalesToMorphInfluences } from "@/lib/virtual-fitting/measurements-to-body-morphs";
import { updateSkinnedMeshes } from "@/lib/virtual-fitting/avatar-scene-utils";
import type { AvatarZoneScales } from "@/types/avatar-calibration";
import {
  BODY_MORPH_TARGET_NAMES,
  BODY_MORPH_ZONES,
  type BodyMorphInfluences,
} from "@/types/body-morph";
import type { AvatarGender } from "@/types/virtual-fitting";

function isBodyMorphMesh(name: string): boolean {
  const n = name.toLowerCase();
  if (n.includes("eye") || n.includes("teeth") || n.includes("tongue")) {
    return false;
  }
  return n.includes("body") || n.includes("wolf3d_avatar") || n.includes("avatar");
}

function applyInfluencesToMesh(
  mesh: Mesh,
  influences: BodyMorphInfluences,
  gender: AvatarGender,
): void {
  ensureProceduralBodyMorphs(mesh, gender);
  sanitizeMeshMorphTargets(mesh);

  const dict = mesh.morphTargetDictionary;
  const values = mesh.morphTargetInfluences;
  const morphCount = mesh.geometry.morphAttributes?.position?.length ?? 0;
  if (!dict || !values || morphCount === 0 || values.length !== morphCount) {
    return;
  }

  for (const zone of BODY_MORPH_ZONES) {
    const targetName = BODY_MORPH_TARGET_NAMES[zone];
    const idx = dict[targetName];
    if (typeof idx !== "number" || idx < 0 || idx >= values.length) continue;
    values[idx] = influences[zone];
  }
}

/**
 * Deforma el cuerpo con morphTargetInfluences según medidas del escaneo.
 * Usa morphs del GLB (`vf_*`) si existen; si no, los genera por zona en runtime.
 */
export function applyAvatarBodyMorphs(
  root: Object3D,
  influences: BodyMorphInfluences,
  gender: AvatarGender,
): void {
  let applied = false;

  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    if (!isBodyMorphMesh(node.name || "")) return;
    applyInfluencesToMesh(node, influences, gender);
    applied = true;
  });

  if (!applied && root instanceof Group) {
    const body = findMainBodyMesh(root);
    if (body) applyInfluencesToMesh(body, influences, gender);
  }

  updateSkinnedMeshes(root);
}

export function applyAvatarBodyMorphsFromZones(
  root: Object3D,
  zones: AvatarZoneScales,
  gender: AvatarGender,
  heightScale = 1,
): void {
  applyAvatarBodyMorphs(
    root,
    zoneScalesToMorphInfluences(zones, heightScale),
    gender,
  );
}
