"""
Camiseta holgada: un solo cubo subdividido + Shrinkwrap (solo si el preview falla).

  blender --python tools/blender/build_tshirt_volume.py

Preferir fix_tshirt_wip.py (importa tshirt-preview.glb).
"""
from __future__ import annotations

import bpy
from mathutils import Vector

BODY_NAME = "male_basemesh"
SHIRT_NAME = "Tshirt_WIP"
SHRINK_OFFSET = 0.04


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(cor) for cor in obj.bound_box]
    return (
        Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners))),
        Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners))),
    )


def main() -> None:
    body = bpy.data.objects[BODY_NAME]
    old = bpy.data.objects.get(SHIRT_NAME)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)

    bmin, bmax = world_bbox(body)
    center = (bmin + bmax) * 0.5
    h = bmax.z - bmin.z
    z0 = bmin.z + h * 0.42
    z1 = bmin.z + h * 0.75
    loc = Vector((center.x, center.y, (z0 + z1) * 0.5))
    scale = Vector(
        ((bmax.x - bmin.x) * 1.35 * 0.5, (bmax.y - bmin.y) * 3.2 * 0.5 + 0.05, (z1 - z0) * 1.05 * 0.5)
    )

    bpy.ops.mesh.primitive_cube_add(size=1, location=tuple(loc))
    shirt = bpy.context.active_object
    shirt.name = SHIRT_NAME
    shirt.scale = tuple(scale)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.subdivide(number_cuts=5)
    bpy.ops.object.mode_set(mode="OBJECT")

    sw = shirt.modifiers.new("ShrinkwrapFit", "SHRINKWRAP")
    sw.target = body
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.wrap_mode = "ABOVE_SURFACE"
    sw.offset = SHRINK_OFFSET

    sol = shirt.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = 0.007
    sol.offset = 1.0

    sub = shirt.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = 2

    shirt.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    shirt.parent = body
    print(f"✅ {SHIRT_NAME} volumen listo (revisar en viewport antes de Apply)")


if __name__ == "__main__":
    main()
