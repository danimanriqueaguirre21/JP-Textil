"""
Reajuste seguro: polo centrado + shrinkwrap (brazos y espalda).
"""
from __future__ import annotations

import bpy
import bmesh
from mathutils import Vector

SHRINK = 0.032
BACK_OFFSET = 0.018
ARM_OFFSET = 0.026


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    c = [obj.matrix_world @ Vector(x) for x in obj.bound_box]
    return (
        Vector((min(v.x for v in c), min(v.y for v in c), min(v.z for v in c))),
        Vector((max(v.x for v in c), max(v.y for v in c), max(v.z for v in c))),
    )


def mesh_world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    pts = [obj.matrix_world @ Vector(v.co) for v in obj.data.vertices]
    return (
        Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))),
        Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts))),
    )


def get_body() -> bpy.types.Object:
    o = bpy.data.objects.get("male_basemesh")
    if o:
        return o
    meshes = [x for x in bpy.data.objects if x.type == "MESH" and "tecido" not in x.name.lower() and "camiseta" not in x.name.lower()]
    return max(meshes, key=lambda x: len(x.data.vertices))


def get_shirt(body: bpy.types.Object) -> bpy.types.Object:
    for n in bpy.data.objects:
        if n.type != "MESH":
            continue
        ln = n.name.lower()
        if "polo" in ln or "camiseta" in ln or "tecido" in ln:
            return n
    raise RuntimeError("Sin polo")


def center_mesh_local(shirt: bpy.types.Object) -> None:
    bm = bmesh.new()
    bm.from_mesh(shirt.data)
    if not bm.verts:
        bm.free()
        return
    cx = sum(v.co.x for v in bm.verts) / len(bm.verts)
    cy = sum(v.co.y for v in bm.verts) / len(bm.verts)
    cz = sum(v.co.z for v in bm.verts) / len(bm.verts)
    bmesh.ops.translate(bm, vec=(-cx, -cy, -cz))
    bm.to_mesh(shirt.data)
    bm.free()
    shirt.data.update()
    shirt.location = (0.0, 0.0, 0.0)
    shirt.rotation_euler = (0.0, 0.0, 0.0)
    shirt.scale = (1.0, 1.0, 1.0)


def uniform_scale_to_body(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    bb, bt = mesh_world_bbox(body)
    bs, st = mesh_world_bbox(shirt)
    bc = (bb + bt) * 0.5
    sc = (bs + st) * 0.5
    b_torso_z = (bt.z - bb.z) * 0.42
    s_torso_z = max(st.z - bs.z, 1e-6)
    factor = min(max(b_torso_z / s_torso_z, 0.5), 2.0) * 1.06
    shirt.scale = (factor, factor * 1.08, factor)
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.transform_apply(scale=True)
    shirt.location = bc - (mesh_world_bbox(shirt)[0] + mesh_world_bbox(shirt)[1]) * 0.5


def vertex_group_arms_back(shirt: bpy.types.Object, body: bpy.types.Object) -> tuple[str, str]:
    bb, bt = world_bbox(body)
    bc = (bb + bt) * 0.5
    arm_x = (bt.x - bb.x) * 0.34
    back_y = bc.y - (bt.y - bb.y) * 0.12

    for nm in ("VG_Arms", "VG_Back"):
        if nm in shirt.vertex_groups:
            shirt.vertex_groups.remove(shirt.vertex_groups[nm])

    vg_arm = shirt.vertex_groups.new(name="VG_Arms")
    vg_back = shirt.vertex_groups.new(name="VG_Back")

    for v in shirt.data.vertices:
        w = shirt.matrix_world @ v.co
        if abs(w.x - bc.x) > arm_x and bb.z + (bt.z - bb.z) * 0.38 < w.z < bt.z - (bt.z - bb.z) * 0.1:
            vg_arm.add([v.index], 1.0, "REPLACE")
        if w.y < back_y and bb.z + (bt.z - bb.z) * 0.35 < w.z < bt.z - (bt.z - bb.z) * 0.08:
            vg_back.add([v.index], 1.0, "REPLACE")
    return "VG_Arms", "VG_Back"


def shrinkwrap_passes(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    for m in list(shirt.modifiers):
        if m.type == "SHRINKWRAP":
            shirt.modifiers.remove(m)

    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt

    sw = shirt.modifiers.new("FitBase", "SHRINKWRAP")
    sw.target = body
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.wrap_mode = "ABOVE_SURFACE"
    sw.offset = SHRINK
    bpy.ops.object.modifier_apply(modifier=sw.name)

    vg_arm, vg_back = vertex_group_arms_back(shirt, body)

    sw_a = shirt.modifiers.new("FitArms", "SHRINKWRAP")
    sw_a.target = body
    sw_a.wrap_method = "NEAREST_SURFACEPOINT"
    sw_a.wrap_mode = "ABOVE_SURFACE"
    sw_a.offset = SHRINK + ARM_OFFSET
    sw_a.vertex_group = vg_arm
    try:
        bpy.ops.object.modifier_apply(modifier=sw_a.name)
    except Exception:
        shirt.modifiers.remove(sw_a)

    sw_b = shirt.modifiers.new("FitBack", "SHRINKWRAP")
    sw_b.target = body
    sw_b.wrap_method = "NEAREST_SURFACEPOINT"
    sw_b.wrap_mode = "ABOVE_SURFACE"
    sw_b.offset = SHRINK + BACK_OFFSET
    sw_b.vertex_group = vg_back
    try:
        bpy.ops.object.modifier_apply(modifier=sw_b.name)
    except Exception:
        shirt.modifiers.remove(sw_b)


def main() -> None:
    body = get_body()
    shirt = get_shirt(body)
    print("Ajustando", shirt.name)

    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    center_mesh_local(shirt)
    uniform_scale_to_body(shirt, body)
    shrinkwrap_passes(shirt, body)

    shirt.name = "Polo_Realistic"
    shirt.parent = body
    body.display_type = "WIRE"

    path = r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\clothing\polo-realistic-wip.glb"
    bpy.ops.export_scene.gltf(filepath=path, use_selection=True, export_apply=True, export_format="GLB", export_materials="EXPORT")
    bb, bt = mesh_world_bbox(shirt)
    bbody = world_bbox(body)
    print("Polo Y:", round(bb.y, 3), round(bt.y, 3), "| Cuerpo Y:", round(bbody[0].y, 3), round(bbody[1].y, 3))
    print("Verts:", len(shirt.data.vertices), "|", path)


if __name__ == "__main__":
    main()
