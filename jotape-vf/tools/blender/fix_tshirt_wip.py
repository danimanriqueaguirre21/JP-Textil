"""
Camiseta holgada sobre male_basemesh.

Método recomendado (volumen + Shrinkwrap, no malla extraída del cuerpo):
  Ver create_realistic_tshirt.py o el bloque volumétrico en main() abajo.

Alternativa (solo si la base procedural ya se ve bien):
  importar tshirt-preview.glb, recortar cuello/mangas, Solidify sin Shrinkwrap.

  blender archivo.blend --python tools/blender/fix_tshirt_wip.py
"""
from __future__ import annotations

import bpy
import bmesh
from mathutils import Vector

BODY_NAME = "male_basemesh"
SHIRT_NAME = "Tshirt_WIP"
PREVIEW_GLB = r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\clothing\tshirt-preview.glb"

# Altura en eje Z (avatar de pie)
NECK_Z = 1.28
HEM_Z = 0.62
SLEEVE_X = 0.38
SLEEVE_Z_MAX = 1.06
NORMAL_PUSH = 0.012
BACK_PUSH_Y = -0.018  # más cobertura espalda (Y negativo)


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return (
        Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners))),
        Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners))),
    )


def remove_objects(names: tuple[str, ...]) -> None:
    for name in names:
        o = bpy.data.objects.get(name)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)


def import_preview() -> bpy.types.Object:
    remove_objects(
        (
            SHIRT_NAME,
            "tshirt_preview",
            "tshirt_preview.001",
            "tshirt_preview.002",
            "Tshirt_Final",
        )
    )
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=PREVIEW_GLB)
    new_objs = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
    if not new_objs:
        raise RuntimeError("No mesh imported from preview GLB")
    shirt = max(new_objs, key=lambda o: len(o.data.vertices))
    shirt.name = SHIRT_NAME
    for o in new_objs:
        if o is not shirt:
            bpy.data.objects.remove(o, do_unlink=True)
    for o in list(bpy.data.objects):
        if o.type == "EMPTY" and "tshirt" in o.name.lower():
            bpy.data.objects.remove(o, do_unlink=True)
    return shirt


def edit_mesh(shirt: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(shirt.data)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()

    def vert_world(v: bmesh.types.BMVert) -> Vector:
        return shirt.matrix_world @ v.co

    to_delete = []
    for v in bm.verts:
        w = vert_world(v)
        if w.z > NECK_Z or w.z < HEM_Z:
            to_delete.append(v)
            continue
        if abs(w.x) > SLEEVE_X and w.z < SLEEVE_Z_MAX:
            to_delete.append(v)

    if to_delete:
        bmesh.ops.delete(bm, geom=to_delete, context="VERTS")

    bm.verts.ensure_lookup_table()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    inv = shirt.matrix_world.inverted()
    for v in bm.verts:
        w = vert_world(v)
        push = v.normal * NORMAL_PUSH
        if w.y < -0.02:
            push += Vector((0.0, BACK_PUSH_Y, 0.0))
        v.co = inv @ (w + push)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0008)
    bmesh.update_edit_mesh(shirt.data)
    bpy.ops.object.mode_set(mode="OBJECT")
    shirt.data.update()


def setup_modifiers(shirt: bpy.types.Object) -> None:
    for m in list(shirt.modifiers):
        if m.type in {"SHRINKWRAP", "SUBSURF", "SOLIDIFY", "WEIGHTED_NORMAL"}:
            shirt.modifiers.remove(m)

    solid = shirt.modifiers.new("Solidify", "SOLIDIFY")
    solid.thickness = 0.006
    solid.offset = 1.0
    solid.use_even_offset = True

    sub = shirt.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1

    shirt.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")

    bpy.ops.object.shade_smooth()


def ensure_material(shirt: bpy.types.Object) -> None:
    mat_name = "Tshirt_Fabric"
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        mat = bpy.data.materials.new(mat_name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.95, 0.95, 0.95, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.82
    shirt.data.materials.clear()
    shirt.data.materials.append(mat)


def frame_view(body: bpy.types.Object, shirt: bpy.types.Object) -> None:
    for area in bpy.context.screen.areas:
        if area.type != "VIEW_3D":
            continue
        for space in area.spaces:
            if space.type != "VIEW_3D":
                continue
            space.shading.type = "MATERIAL"
            for region in area.regions:
                if region.type != "WINDOW":
                    continue
                override = bpy.context.copy()
                override["area"] = area
                override["region"] = region
                override["space_data"] = space
                with bpy.context.temp_override(**override):
                    bpy.ops.view3d.view_all(center=False)
                break
    body.hide_viewport = False
    shirt.hide_viewport = False


def main() -> None:
    body = bpy.data.objects.get(BODY_NAME)
    if not body:
        bpy.ops.import_scene.gltf(
            filepath=r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\avatars\male.glb"
        )
        meshes = [o for o in bpy.data.objects if o.type == "MESH" and "eye" not in o.name.lower()]
        body = max(meshes, key=lambda o: len(o.data.vertices))
        body.name = BODY_NAME

    shirt = import_preview()
    edit_mesh(shirt)
    setup_modifiers(shirt)
    ensure_material(shirt)
    shirt.parent = body
    frame_view(body, shirt)

    bb = world_bbox(shirt)
    print(f"OK {SHIRT_NAME}: verts={len(shirt.data.vertices)} z=[{bb[0].z:.2f},{bb[1].z:.2f}]")


if __name__ == "__main__":
    main()
