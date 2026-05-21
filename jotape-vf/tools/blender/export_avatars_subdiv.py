"""
Blender 3.x — exporta male/female GLB con Subdivision APPLIED (geometría densa).

Uso (GUI):
  Scripting → Open → export_avatars_subdiv.py → Run Script

Uso (CLI):
  blender male_basemesh_v002.blend --background --python export_avatars_subdiv.py

Salida:
  ../../frontend/public/models/avatars/male.glb
  ../../frontend/public/models/avatars/female.glb
"""

import bpy
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(
    os.path.join(SCRIPT_DIR, "..", "..", "frontend", "public", "models", "avatars")
)

SUBDIV_VIEW = 1
SUBDIV_RENDER = 2
AUTO_SMOOTH_ANGLE = 0.698132  # 40° rad


def prepare_mesh(obj: bpy.types.Object) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = AUTO_SMOOTH_ANGLE

    mod = obj.modifiers.new(name="Subdivision", type="SUBSURF")
    mod.levels = SUBDIV_VIEW
    mod.render_levels = SUBDIV_RENDER
    bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.ops.object.shade_smooth()
    obj.data.calc_normals()


def export_glb(obj: bpy.types.Object, filename: str) -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_normals=True,
        export_tangents=True,
        export_texcoords=True,
        export_materials="NONE",
    )
    print(f"Exported: {path}")


def main() -> None:
    meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.visible_get()]
    if not meshes:
        raise RuntimeError("No mesh objects in scene")
    body = max(meshes, key=lambda o: len(o.data.polygons))
    prepare_mesh(body)
    name = bpy.path.basename(bpy.data.filepath).lower()
    if "female" in name:
        export_glb(body, "female.glb")
    else:
        export_glb(body, "male.glb")


if __name__ == "__main__":
    main()
