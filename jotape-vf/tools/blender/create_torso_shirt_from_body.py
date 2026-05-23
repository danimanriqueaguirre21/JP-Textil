"""
Camiseta torso (sin mangas) desde caras del cuerpo CC_Base_Body.

NO modifica armature, pose ni huesos.
Duplica cuerpo → extrae torso → escala → cuello/hem → solidify → subdiv → parent auto.

Uso:
  blender escena.blend --python tools/blender/create_torso_shirt_from_body.py
"""
from __future__ import annotations

import bpy
import bmesh
from mathutils import Vector

BODY_NAME = "CC_Base_Body"
ARMATURE_NAME = "Armature"
SHIRT_NAME = "Camiseta_Torso"
SOLIDIFY = 0.009
SUBDIV_LEVELS = 1
SCALE_OUT = 1.025

# Ratios altura torso (cuello abierto, sin mangas, sin abdomen bajo)
Z_MIN_RATIO = 0.38
Z_MAX_RATIO = 0.72
X_MAX_RATIO = 0.44


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return (
        Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners))),
        Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners))),
    )


def face_world_center(obj: bpy.types.Object, face: bmesh.types.BMFace) -> Vector:
    co = face.calc_center_median()
    return obj.matrix_world @ co


def in_torso_region(obj: bpy.types.Object, pt: Vector, bmin: Vector, bmax: Vector) -> bool:
    h = bmax.z - bmin.z
    z0 = bmin.z + h * Z_MIN_RATIO
    z1 = bmin.z + h * Z_MAX_RATIO
    cx = (bmin.x + bmax.x) * 0.5
    half_x = (bmax.x - bmin.x) * 0.5 * X_MAX_RATIO
    if pt.z < z0 or pt.z > z1:
        return False
    if abs(pt.x - cx) > half_x:
        return False
    return True


def duplicate_body_workmesh(body: bpy.types.Object) -> bpy.types.Object:
    old = bpy.data.objects.get(SHIRT_NAME)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)

    work = body.copy()
    work.data = body.data.copy()
    work.name = "_shirt_work_tmp"
    bpy.context.collection.objects.link(work)
    return work


def extract_torso_mesh(work: bpy.types.Object, body: bpy.types.Object) -> bpy.types.Object:
    bmin, bmax = world_bbox(body)

    bpy.ops.object.select_all(action="DESELECT")
    work.select_set(True)
    bpy.context.view_layer.objects.active = work
    bpy.ops.object.mode_set(mode="EDIT")

    bm = bmesh.from_edit_mesh(work.data)
    bm.faces.ensure_lookup_table()
    bm.verts.ensure_lookup_table()

    for f in bm.faces:
        f.select = in_torso_region(work, face_world_center(work, f), bmin, bmax)

    # Invertir: borrar todo lo que NO es torso
    bpy.ops.mesh.select_all(action="INVERT")
    bpy.ops.mesh.delete(type="FACE")

    bm = bmesh.from_edit_mesh(work.data)
    if not bm.faces:
        raise RuntimeError("No quedaron caras de torso; ajusta ratios Z/X")

    bpy.ops.object.mode_set(mode="OBJECT")
    work.name = SHIRT_NAME
    return work


def push_along_normals(obj: bpy.types.Object, dist: float) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.transform.push_pull(value=dist, mirror=False)
    bpy.ops.object.mode_set(mode="OBJECT")


def scale_slightly(obj: bpy.types.Object, factor: float) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.transform.resize(value=(factor, factor, factor))
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.transform_apply(scale=True)


def cut_neck_opening(obj: bpy.types.Object, body: bpy.types.Object) -> None:
    bmin, bmax = world_bbox(body)
    neck_z = bmin.z + (bmax.z - bmin.z) * 0.68

    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(obj.data)
    bm.faces.ensure_lookup_table()
    to_del = []
    for f in bm.faces:
        if face_world_center(obj, f).z > neck_z:
            to_del.append(f)
    if to_del:
        bmesh.ops.delete(bm, geom=to_del, context="FACES")
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def extrude_hem(obj: bpy.types.Object, body: bpy.types.Object) -> None:
    bmin, bmax = world_bbox(body)
    hem_z = bmin.z + (bmax.z - bmin.z) * Z_MIN_RATIO

    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(obj.data)
    bm.faces.ensure_lookup_table()
    bm.edges.ensure_lookup_table()
    bpy.ops.mesh.select_all(action="DESELECT")

    for e in bm.edges:
        if not e.is_boundary:
            continue
        vzs = [(obj.matrix_world @ v.co).z for v in e.verts]
        if max(vzs) < hem_z + 0.02:
            e.select_set(True)

    try:
        bpy.ops.mesh.extrude_region_move(
            TRANSFORM_OT_translate={"value": (0.0, 0.0, -0.008)}
        )
    except Exception:
        pass

    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def add_modifiers(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    for m in list(obj.modifiers):
        obj.modifiers.remove(m)

    sol = obj.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = SOLIDIFY
    sol.offset = 1.0
    sol.use_even_offset = True

    sub = obj.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = SUBDIV_LEVELS
    sub.render_levels = SUBDIV_LEVELS

    bpy.ops.object.shade_smooth()
    for p in obj.data.polygons:
        p.use_smooth = True


def parent_auto_weights(shirt: bpy.types.Object, armature: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")


def ensure_material(shirt: bpy.types.Object) -> None:
    mat = bpy.data.materials.get("Camiseta_Tela")
    if not mat:
        mat = bpy.data.materials.new("Camiseta_Tela")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.95, 0.94, 0.91, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.82
    shirt.data.materials.clear()
    shirt.data.materials.append(mat)


def main() -> None:
    body = bpy.data.objects.get(BODY_NAME)
    arm = bpy.data.objects.get(ARMATURE_NAME)
    if not body or body.type != "MESH":
        raise RuntimeError(f"No se encontró {BODY_NAME}")
    if not arm or arm.type != "ARMATURE":
        raise RuntimeError(f"No se encontró {ARMATURE_NAME}")

    work = duplicate_body_workmesh(body)
    shirt = extract_torso_mesh(work, body)
    scale_slightly(shirt, SCALE_OUT)
    push_along_normals(shirt, 0.004)
    cut_neck_opening(shirt, body)
    extrude_hem(shirt, body)
    add_modifiers(shirt)
    ensure_material(shirt)
    parent_auto_weights(shirt, arm)

    body.hide_viewport = False
    print(f"✅ {SHIRT_NAME} creada ({len(shirt.data.vertices)} verts)")
    print("   Torso desde caras | Sin mangas | Parent ARMATURE_AUTO")
    print("   Armature y pose sin cambios")


if __name__ == "__main__":
    main()
