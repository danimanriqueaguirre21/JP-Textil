"""
Guarda la pose actual como Action (recomendado para CC_Base + shape keys).

"Apply Pose as Rest Pose" en rigs CC suele dejar huesos y malla desalineados
(la malla tiene 149 shape keys y bind antiguo).

Uso:
  1. Pose perfecta en viewport
  2. blender escena.blend --python tools/blender/save_default_pose_asset.py
  3. Ctrl+S

Reaplicar:
  blender escena.blend --python tools/blender/save_default_pose_asset.py -- --apply
"""
from __future__ import annotations

import sys

import bpy

ARMATURE_NAME = "Armature"
ACTION_NAME = "VF_DefaultPose"


def get_armature() -> bpy.types.Object:
    o = bpy.data.objects.get(ARMATURE_NAME)
    if o and o.type == "ARMATURE":
        return o
    for obj in bpy.data.objects:
        if obj.type == "ARMATURE":
            return obj
    raise RuntimeError("No hay armature")


def save_pose_action(arm: bpy.types.Object) -> bpy.types.Action:
    if bpy.context.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")

    old = bpy.data.actions.get(ACTION_NAME)
    if old:
        bpy.data.actions.remove(old)

    act = bpy.data.actions.new(ACTION_NAME)
    act.use_fake_user = True

    for pb in arm.pose.bones:
        if pb.rotation_mode == "QUATERNION":
            path = f'pose.bones["{pb.name}"].rotation_quaternion'
            vals = pb.rotation_quaternion
            count = 4
        else:
            path = f'pose.bones["{pb.name}"].rotation_euler'
            vals = pb.rotation_euler
            count = 3
        for i in range(count):
            cur = act.fcurves.new(path, index=i)
            cur.keyframe_points.insert(0, vals[i])
            cur.keyframe_points[0].interpolation = "LINEAR"

    if arm.animation_data is None:
        arm.animation_data_create()
    arm.animation_data.action = act
    bpy.context.scene.frame_set(0)
    bpy.ops.object.mode_set(mode="OBJECT")
    return act


def apply_pose_action(arm: bpy.types.Object) -> None:
    act = bpy.data.actions.get(ACTION_NAME)
    if not act:
        raise RuntimeError(f"No existe {ACTION_NAME}. Guarda la pose primero.")

    if arm.animation_data is None:
        arm.animation_data_create()
    arm.animation_data.action = act
    bpy.context.scene.frame_set(0)
    bpy.context.view_layer.update()


def main() -> None:
    arm = get_armature()
    if "--apply" in sys.argv:
        apply_pose_action(arm)
        print(f"✅ Pose reaplicada ({ACTION_NAME})")
        return

    save_pose_action(arm)
    print(f"✅ Pose guardada en action {ACTION_NAME}")
    print("   Evita Apply Rest Pose en CC. Guarda .blend (Ctrl+S).")


if __name__ == "__main__":
    main()
