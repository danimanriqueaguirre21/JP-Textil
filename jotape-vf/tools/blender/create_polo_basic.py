"""
Polo básico manga corta — malla simple sobre maniquí seleccionado.

  blender escena.blend --python tools/blender/create_polo_basic.py
"""
from __future__ import annotations

import bpy
import bmesh
from mathutils import Vector

SHIRT_NAME = "Polo_Basic"
EXPORT = (
    r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\clothing\polo-basic.glb"
)
OFFSET = 0.03
THICKNESS = 0.008


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    c = [obj.matrix_world @ Vector(x) for x in obj.bound_box]
    return (
        Vector((min(v.x for v in c), min(v.y for v in c), min(v.z for v in c))),
        Vector((max(v.x for v in c), max(v.y for v in c), max(v.z for v in c))),
    )


def get_body() -> bpy.types.Object:
    obj = bpy.context.active_object
    if obj and obj.type == "MESH" and "eye" not in obj.name.lower():
        return obj
    for name in ("male_basemesh", "female_basemesh"):
        o = bpy.data.objects.get(name)
        if o and o.type == "MESH":
            return o
    meshes = [
        o
        for o in bpy.data.objects
        if o.type == "MESH"
        and "eye" not in o.name.lower()
        and "polo" not in o.name.lower()
        and "camiseta" not in o.name.lower()
    ]
    return max(meshes, key=lambda o: len(o.data.vertices))


def remove_old() -> None:
    for o in list(bpy.data.objects):
        if o.type == "MESH" and ("polo" in o.name.lower() or o.name in (SHIRT_NAME, "Polo_Realistic")):
            bpy.data.objects.remove(o, do_unlink=True)


def grid(bm, w, h, center, cx, cz):
    hw, hh = w * 0.5, h * 0.5
    rx, rz = cx + 1, cz + 1
    verts = []
    for iz in range(rz):
        for ix in range(rx):
            x = -hw + w * ix / max(cx, 1)
            z = -hh + h * iz / max(cz, 1)
            verts.append(bm.verts.new(center + Vector((x, 0.0, z))))
    for iz in range(cz):
        for ix in range(cx):
            i = iz * rx + ix
            bm.faces.new((verts[i], verts[i + 1], verts[i + rx + 1], verts[i + rx]))


def build_polo(body: bpy.types.Object) -> bpy.types.Object:
    bmin, bmax = world_bbox(body)
    c = (bmin + bmax) * 0.5
    sz = bmax - bmin
    h = sz.z

    z0 = bmin.z + h * 0.40
    z1 = bmin.z + h * 0.74
    torso_h = z1 - z0
    tw = sz.x * 1.12 * 0.55
    depth = max(sz.y * 0.7, 0.055)
    mid = (z0 + z1) * 0.5

    bm = bmesh.new()
    grid(bm, tw * 2, torso_h, Vector((c.x, c.y + depth * 0.5, mid)), 10, 12)
    grid(bm, tw * 2.08, torso_h * 1.02, Vector((c.x, c.y - depth * 0.52, mid)), 10, 12)

    slen = sz.x * 0.32
    az = bmin.z + h * 0.67
    for sign in (-1, 1):
        sx = c.x + sign * (tw + slen * 0.42)
        for dy in (depth * 0.48, -depth * 0.5):
            grid(bm, slen, h * 0.12, Vector((sx, c.y + dy, az)), 7, 3)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.04)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"{SHIRT_NAME}_mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(SHIRT_NAME, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def trim_neck(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    bmin, bmax = world_bbox(body)
    h = bmax.z - bmin.z
    neck = bmin.z + h * 0.72
    hem = bmin.z + h * 0.39
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(shirt.data)
    del_v = [v for v in bm.verts if (shirt.matrix_world @ v.co).z > neck or (shirt.matrix_world @ v.co).z < hem]
    if del_v:
        bmesh.ops.delete(bm, geom=del_v, context="VERTS")
    bmesh.update_edit_mesh(shirt.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def modifiers_and_material(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt

    sol = shirt.modifiers.new("Thick", "SOLIDIFY")
    sol.thickness = THICKNESS
    sol.offset = 1.0
    sol.use_even_offset = True
    bpy.ops.object.modifier_apply(modifier=sol.name)

    sw = shirt.modifiers.new("Fit", "SHRINKWRAP")
    sw.target = body
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.wrap_mode = "ABOVE_SURFACE"
    sw.offset = OFFSET
    bpy.ops.object.modifier_apply(modifier=sw.name)

    sub = shirt.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = 1
    bpy.ops.object.modifier_apply(modifier=sub.name)

    mat = bpy.data.materials.new("Polo_Basic_White")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.95, 0.94, 0.91, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.82
    shirt.data.materials.clear()
    shirt.data.materials.append(mat)
    bpy.ops.object.shade_smooth()


def main() -> None:
    remove_old()
    body = get_body()
    shirt = build_polo(body)
    trim_neck(shirt, body)
    modifiers_and_material(shirt, body)
    shirt.parent = body
    body.display_type = "WIRE"

    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.export_scene.gltf(
        filepath=EXPORT,
        use_selection=True,
        export_apply=True,
        export_format="GLB",
        export_materials="EXPORT",
    )

    bb, bt = world_bbox(shirt)
    print(f"✅ {SHIRT_NAME}: {len(shirt.data.vertices)} verts")
    print(f"   Z {bb.z:.2f}–{bt.z:.2f} | Export: {EXPORT}")


if __name__ == "__main__":
    main()
