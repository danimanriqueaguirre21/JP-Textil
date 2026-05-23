import { AnimationClip, AnimationMixer, Object3D } from "three";

import { updateSkinnedMeshes } from "@/lib/virtual-fitting/avatar-scene-utils";

function findPoseMixerRoot(root: Object3D): Object3D {
  let armature: Object3D | null = null;
  root.traverse((node) => {
    if (node.name === "Armature") armature = node;
  });
  return armature ?? root;
}

/**
 * Aplica el frame 0 de la animación del GLB (pose A exportada desde Blender).
 * Debe llamarse después de cada clone del avatar (el clon vuelve a bind pose).
 */
export function applyGltfPoseFrameZero(
  root: Object3D,
  clips: AnimationClip[] | undefined,
): void {
  const clip = clips?.[0];
  if (!clip?.tracks?.length) return;

  const mixerRoot = findPoseMixerRoot(root);

  try {
    const mixer = new AnimationMixer(mixerRoot);
    const action = mixer.clipAction(clip);
    action.play();
    mixer.setTime(0);
    mixer.update(0);
    updateSkinnedMeshes(root);
  } catch {
    /* bind pose si falla */
  }
}
