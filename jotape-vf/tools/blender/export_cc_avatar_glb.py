"""
Exporta avatar Character Creator (CC_Base + Armature) a male.glb o female.glb.

Incluye la pose actual como animación en frame 0 (la web la aplica al cargar).
NO usa Apply Rest Pose (rompe malla CC con shape keys).

Uso:
  blender escena.blend --python tools/blender/export_cc_avatar_glb.py
  blender escena.blend --python tools/blender/export_cc_avatar_glb.py -- --female
"""
from __future__ import annotations

import sys

import bpy
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AVATARS_DIR = os.path.normpath(
    os.path.join(SCRIPT_DIR, "..", "..", "frontend", "public", "models", "avatars")
)

ARMATURE_NAME = "Armature"
BODY_PREFIX = "CC_Base_"
ACTION_NAME = "VF_APose"
EXPORT_MESHES = (
    "CC_Base_Body",
    "CC_Base_Eye",
    "CC_Base_EyeOcclusion",
    "CC_Base_TearLine",
    "CC_Base_Teeth",
    "CC_Base_Tongue",
)


def get_armature() -> bpy.types.Object:
    o = bpy.data.objects.get(ARMATURE_NAME)
    if o and o.type == "ARMATURE":
        return o
    raise RuntimeError(f"No se encontró {ARMATURE_NAME}")


def collect_export_objects() -> list[bpy.types.Object]:
    arm = get_armature()
    objs = [arm]
    for name in EXPORT_MESHES:
        o = bpy.data.objects.get(name)
        if o and o.type == "MESH":
            objs.append(o)
    if len(objs) < 2:
        raise RuntimeError("Faltan mallas CC_Base_* para exportar")
    return objs


def bake_pose_action(arm: bpy.types.Object) -> bpy.types.Action:
    if bpy.context.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")

    old = bpy.data.actions.get(ACTION_NAME)
    if old:
        bpy.data.actions.remove(old)

    act = bpy.data.actions.new(ACTION_NAME)
    act.use_fake_user = True

    if arm.animation_data is None:
        arm.animation_data_create()
    arm.animation_data.action = act

    bpy.context.scene.frame_start = 0
    bpy.context.scene.frame_end = 0
    bpy.context.scene.frame_set(0)

    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")

    for pb in arm.pose.bones:
        if pb.rotation_mode == "QUATERNION":
            pb.keyframe_insert(data_path="rotation_quaternion", frame=0)
        else:
            pb.keyframe_insert(data_path="rotation_euler", frame=0)

    bpy.ops.object.mode_set(mode="OBJECT")
    return act


def export_glb(objects: list[bpy.types.Object], path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)

    if bpy.context.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
        obj.hide_viewport = False
    bpy.context.view_layer.objects.active = objects[0]

    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_animations=True,
        export_frame_range=True,
        export_force_sampling=True,
        export_nla_strips=False,
        export_def bones=True,
        export_skins=True,
        export_morph=True,
        export_morph_normal=False,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_yup=True,
    )


def resolve_paths() -> tuple[str, str | None]:
    female = "--female" in sys.argv
    name = "female.glb" if female else "male.glb"
    backup = "female-basemesh-backup.glb" if female else "male-basemesh-backup.glb"
    out_path = os.path.join(AVATARS_DIR, name)
    backup_path = os.path.join(AVATARS_DIR, backup)
    return out_path, backup_path


def main() -> None:
    out_path, backup_path = resolve_paths()
    arm = get_armature()
    objects = collect_export_objects()
    bake_pose_action(arm)

    if backup_path and os.path.isfile(out_path) and not os.path.isfile(backup_path):
        import shutil

        shutil.copy2(out_path, backup_path)
        print(f"Backup: {backup_path}")

    export_glb(objects, out_path)
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"✅ Exportado: {out_path} ({size_mb:.1f} MB)")
    print(f"   Objetos: {[o.name for o in objects]}")
    print(f"   Animación: {ACTION_NAME} (frame 0)")


if __name__ == "__main__":
    main()
