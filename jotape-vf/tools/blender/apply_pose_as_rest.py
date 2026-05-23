"""
Guarda la pose actual como REST POSE del armature.

⚠️ NO recomendado para CC_Base_Body (shape keys): huesos y malla se desalinean.
   Usa save_default_pose_asset.py o deja la pose en Pose Mode + set_a_pose.py.

Uso:
  blender escena.blend --python tools/blender/apply_pose_as_rest.py
"""
from __future__ import annotations

import bpy

ARMATURE_NAME = "Armature"


def get_armature() -> bpy.types.Object:
    o = bpy.data.objects.get(ARMATURE_NAME)
    if o and o.type == "ARMATURE":
        return o
    for obj in bpy.data.objects:
        if obj.type == "ARMATURE":
            return obj
    raise RuntimeError("No hay armature en la escena")


def main() -> None:
    arm = get_armature()
    if bpy.context.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")

    bpy.ops.pose.select_all(action="SELECT")
    bpy.ops.pose.armature_apply(selected=False)
    # Tras cambiar rest pose, los huesos siguen con offset de pose → la malla no coincide.
    bpy.ops.pose.transforms_clear()
    bpy.context.view_layer.update()
    bpy.ops.object.mode_set(mode="OBJECT")

    print("✅ Pose actual → rest pose + pose limpiada (malla alineada)")
    print("   Guarda el .blend (Ctrl+S) y re-exporta GLB si lo usas en /try-on")
    print("   CC_Base_Body tiene shape keys: no uses Apply Modifier en Armature.")


if __name__ == "__main__":
    main()
