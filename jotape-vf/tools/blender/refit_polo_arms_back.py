"""
Ajusta el polo existente al maniquí: brazos + cobertura de espalda.

Detecta: Polo_Realistic, camiseta_fbx*, o mesh de ropa seleccionado.
"""
from __future__ import annotations

import bpy
import bmesh
from mathutils import Vector

BODY_CANDIDATES = ("male_basemesh", "female_basemesh")
SHRINK_OFFSET = 0.028
BACK_EXTRA_Y = 1.22
ARM_EXTRA_X = 1.12
SLEEVE_Z_EXTEND = 0.04


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return (
        Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners))),
        Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners))),
    )


def get_body() -> bpy.types.Object:
    for name in BODY_CANDIDATES:
        o = bpy.data.objects.get(name)
        if o and o.type == "MESH":
            return o
    sel = [o for o in bpy.context.selected_objects if o.type == "MESH" and "camiseta" not in o.name.lower() and "polo" not in o.name.lower()]
    if sel:
        return max(sel, key=lambda o: len(o.data.vertices))
    meshes = [
        o
        for o in bpy.data.objects
        if o.type == "MESH"
        and "eye" not in o.name.lower()
        and "camiseta" not in o.name.lower()
        and "polo" not in o.name.lower()
        and "tecido" not in o.name.lower()
    ]
    return max(meshes, key=lambda o: len(o.data.vertices))


def get_shirt(body: bpy.types.Object) -> bpy.types.Object:
    for name in ("Polo_Realistic", "polo_realistic"):
        o = bpy.data.objects.get(name)
        if o and o.type == "MESH":
            return o
    for o in bpy.context.selected_objects:
        if o.type == "MESH" and o is not body:
            return o
    for o in bpy.data.objects:
        n = o.name.lower()
        if o.type == "MESH" and ("camiseta" in n or "polo" in n or "tecido" in n or "tshirt" in n):
            return o
    raise RuntimeError("No se encontró mesh de polo/camiseta")


def align_and_scale(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="MEDIAN")

    bb, bt = world_bbox(body)
    bs, st = world_bbox(shirt)
    bc = (bb + bt) * 0.5
    sc = (bs + st) * 0.5
    shirt.location += bc - sc

    bsize = bt - bb
    ssize = st - bs
    for i, axis in enumerate("xyz"):
        if ssize[i] < 1e-6:
            continue
    sx = (bsize.x / ssize.x) * ARM_EXTRA_X
    sy = (bsize.y / ssize.y) * BACK_EXTRA_Y
    sz = (bsize.z / ssize.z) * 1.04
    shirt.scale = (
        shirt.scale.x * sx,
        shirt.scale.y * sy,
        shirt.scale.z * sz,
    )
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    shirt.location = body.location


def extend_sleeves_and_back(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    bb, bt = world_bbox(body)
    bc = (bb + bt) * 0.5
    arm_x = (bt.x - bb.x) * 0.38
    back_y = bb.y - (bt.y - bb.y) * 0.08

    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(shirt.data)
    bm.verts.ensure_lookup_table()
    inv = shirt.matrix_world.inverted()

    for v in bm.verts:
        w = shirt.matrix_world @ v.co
        push = Vector((0.0, 0.0, 0.0))
        # Brazos: más ancho hacia fuera
        if abs(w.x - bc.x) > arm_x * 0.55 and bb.z + (bt.z - bb.z) * 0.45 < w.z < bt.z - (bt.z - bb.z) * 0.12:
            dx = 0.012 if w.x > bc.x else -0.012
            push.x += dx
            if w.z > bb.z + (bt.z - bb.z) * 0.55:
                push.z -= SLEEVE_Z_EXTEND * 0.5
        # Espalda: empujar hacia el cuerpo y un poco hacia atrás para cubrir huecos
        if w.y < back_y:
            push.y -= 0.014
            n = v.normal
            push += n * 0.008
        v.co = inv @ (w + push)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0003)
    bmesh.update_edit_mesh(shirt.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def shrinkwrap_fit(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    for m in list(shirt.modifiers):
        if m.type in {"SHRINKWRAP", "SUBSURF", "SOLIDIFY"}:
            shirt.modifiers.remove(m)

    sw = shirt.modifiers.new("FitTorso", "SHRINKWRAP")
    sw.target = body
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.wrap_mode = "ABOVE_SURFACE"
    sw.offset = SHRINK_OFFSET

    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.modifier_apply(modifier=sw.name)

    # Segunda pasada: más offset en espalda vía desplazamiento normal global leve
    sw2 = shirt.modifiers.new("FitBack", "SHRINKWRAP")
    sw2.target = body
    sw2.wrap_method = "NEAREST_SURFACEPOINT"
    sw2.wrap_mode = "ABOVE_SURFACE"
    sw2.offset = SHRINK_OFFSET + 0.012
    bpy.ops.object.modifier_apply(modifier=sw2.name)


def setup_collision_display(body: bpy.types.Object, shirt: bpy.types.Object) -> None:
    body.display_type = "WIRE"
    shirt.display_type = "SOLID"
    shirt.name = "Polo_Realistic"
    shirt.parent = body
    bpy.ops.object.shade_smooth()


def export_glb(shirt: bpy.types.Object) -> None:
    path = (
        r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\clothing"
        r"\polo-realistic-wip.glb"
    )
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.export_scene.gltf(
        filepath=path,
        use_selection=True,
        export_apply=True,
        export_format="GLB",
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
    )
    print(f"Exportado: {path}")


def main() -> None:
    body = get_body()
    shirt = get_shirt(body)
    print(f"Cuerpo: {body.name} | Polo: {shirt.name}")

    align_and_scale(shirt, body)
    extend_sleeves_and_back(shirt, body)
    shrinkwrap_fit(shirt, body)
    setup_collision_display(body, shirt)
    export_glb(shirt)

    bb = world_bbox(shirt)
    print(f"OK Polo_Realistic — verts {len(shirt.data.vertices)}")
    print(f"   Y espalda: {bb[0].y:.3f} .. {bb[1].y:.3f}  (cuerpo {world_bbox(body)[0].y:.3f}..{world_bbox(body)[1].y:.3f})")


if __name__ == "__main__":
    main()
