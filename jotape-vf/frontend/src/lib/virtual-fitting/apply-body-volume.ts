import { Mesh, Object3D } from "three";

import { findMainBodyMesh } from "@/lib/virtual-fitting/body-mesh";
import { applyBodyVolumeBones } from "@/lib/virtual-fitting/apply-body-volume-bones";
import { applyAvatarBodyMorphs } from "@/lib/virtual-fitting/apply-avatar-body-morphs";
import { bodyVolumeToMorphInfluences } from "@/lib/virtual-fitting/body-volume-to-morph-influences";
import {
  buildAnatomicalVolumeScales,
  computeBodyVolumeParams,
} from "@/lib/virtual-fitting/compute-body-volume-params";
import type { NormalizedAvatarMeasurements } from "@/lib/body-scan/normalize-avatar-measurements";
import { useBoneVolumeOnly } from "@/lib/virtual-fitting/avatar-performance";
import type { AvatarGender } from "@/types/virtual-fitting";
import type { BodyVolumeApplyResult } from "@/types/body-volume";

const GLTF_VOLUME_MORPHS: Record<string, string[]> = {
  bodyFat: ["body_fat", "bodyfat", "fat", "overweight"],
  belly: ["belly", "abdomen", "stomach", "vf_belly"],
  muscular: ["muscular", "muscle", "muscularity", "athletic"],
  wideShoulders: ["wide_shoulders", "shoulder_wide", "broad_shoulders"],
  wideHips: ["wide_hips", "hip_wide", "broad_hips"],
  thin: ["thin", "slim", "lean"],
};

function isBodyMesh(name: string): boolean {
  const n = name.toLowerCase();
  if (n.includes("eye") || n.includes("teeth") || n.includes("tongue")) return false;
  return n.includes("body") || n.includes("wolf3d_avatar") || n.includes("avatar");
}

function findMorphIndex(
  dict: Record<string, number>,
  aliases: string[],
): number | undefined {
  for (const [key, idx] of Object.entries(dict)) {
    const lower = key.toLowerCase();
    if (aliases.some((a) => lower.includes(a))) return idx;
  }
  return undefined;
}

function applyGltfVolumeMorphs(
  mesh: Mesh,
  params: ReturnType<typeof computeBodyVolumeParams>,
): boolean {
  const dict = mesh.morphTargetDictionary;
  const values = mesh.morphTargetInfluences;
  if (!dict || !values?.length) return false;

  const fat = params.bodyFat;
  const thin = 1 - fat;
  const mus = params.muscle * Math.max(0, 1 - fat * 0.9);
  const torsoBoost =
    params.preset === "obese" ? 1 : params.preset === "overweight" ? 0.88 : 0.45;

  const mappings: [string[], number][] = [
    [GLTF_VOLUME_MORPHS.bodyFat, fat * torsoBoost],
    [GLTF_VOLUME_MORPHS.belly, fat * 0.95 * torsoBoost],
    [GLTF_VOLUME_MORPHS.thin, thin * 0.55],
    [GLTF_VOLUME_MORPHS.muscular, mus * 0.35],
    [GLTF_VOLUME_MORPHS.wideShoulders, params.shoulderWidth * 0.25 * (1 - fat * 0.6)],
    [GLTF_VOLUME_MORPHS.wideHips, params.hipWidth * torsoBoost * 0.85],
  ];

  let applied = 0;
  for (const [aliases, influence] of mappings) {
    const idx = findMorphIndex(dict, aliases);
    if (idx === undefined || influence < 0.02) continue;
    values[idx] = Math.min(1, influence);
    applied += 1;
  }

  return applied > 0;
}

function applyVolumeOnMeshes(
  root: Object3D,
  fn: (mesh: Mesh) => boolean,
): boolean {
  let ok = false;
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    if (!isBodyMesh(node.name || "")) return;
    if (fn(node)) ok = true;
  });
  if (!ok && root instanceof Mesh && isBodyMesh(root.name || "")) {
    return fn(root);
  }
  const body = findMainBodyMesh(root as import("three").Group);
  return body ? fn(body) : ok;
}

export function logBodyVolumeDebug(
  result: BodyVolumeApplyResult,
): void {
  if (typeof window === "undefined") return;
  const z = result.zones;
  console.table({
    bodyFat: result.params.bodyFat,
    muscle: result.params.muscle,
    preset: result.params.preset,
    torsoScale: `x${z.torso.x.toFixed(3)} z${z.torso.z.toFixed(3)}`,
    abdomenScale: `x${z.abdomen.x.toFixed(3)} z${z.abdomen.z.toFixed(3)}`,
    hipScale: `x${z.hips.x.toFixed(3)} z${z.hips.z.toFixed(3)}`,
    thighScale: `x${z.thigh.x.toFixed(3)} z${z.thigh.z.toFixed(3)}`,
    upperArmScale: `x${z.upperArm.x.toFixed(3)} z${z.upperArm.z.toFixed(3)}`,
    foreArmScale: `x${z.foreArm.x.toFixed(3)} z${z.foreArm.z.toFixed(3)}`,
    handScale: `x${z.hand.x.toFixed(3)} z${z.hand.z.toFixed(3)}`,
    usingMorphTargets: result.usingMorphTargets,
    morphSource: result.morphSource,
  });
}

/**
 * Body Morph System: volumen corporal sin alterar altura (avatar.scale.y).
 */
export function applyBodyVolume(
  root: Object3D,
  measurements: NormalizedAvatarMeasurements,
  gender: AvatarGender,
): BodyVolumeApplyResult {
  const params = computeBodyVolumeParams(measurements);
  const zones = buildAnatomicalVolumeScales(params);

  let morphSource: BodyVolumeApplyResult["morphSource"] = "bones";
  let usingMorphTargets = false;

  if (useBoneVolumeOnly()) {
    applyBodyVolumeBones(root, zones);
    const result: BodyVolumeApplyResult = {
      params,
      zones,
      usingMorphTargets: false,
      morphSource: "bones",
    };
    logBodyVolumeDebug(result);
    return result;
  }

  const gltfOk = applyVolumeOnMeshes(root, (mesh) =>
    applyGltfVolumeMorphs(mesh, params),
  );

  if (gltfOk) {
    usingMorphTargets = true;
    morphSource = "gltf";
  } else {
    const influences = bodyVolumeToMorphInfluences(params);
    applyAvatarBodyMorphs(root, influences, gender);
    const mesh = findMainBodyMesh(root as import("three").Group);
    const hasVf =
      mesh?.morphTargetDictionary &&
      Object.keys(mesh.morphTargetDictionary).some((k) => k.startsWith("vf_"));
    if (hasVf) {
      usingMorphTargets = true;
      morphSource = "vf_procedural";
    } else {
      applyBodyVolumeBones(root, zones);
      morphSource = "bones";
    }
  }

  const result: BodyVolumeApplyResult = {
    params,
    zones,
    usingMorphTargets,
    morphSource,
  };

  logBodyVolumeDebug(result);
  return result;
}
