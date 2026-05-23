"""
Camiseta realista (holgada) sobre male_basemesh — NO duplica el cuerpo.

Enfoque:
  1. Caja/plano subdividido más grande que el torso (holgura)
  2. Shrinkwrap PROJECT + offset ~0.04 (no pegado al cuerpo)
  3. Solidify 0.01 + Even Thickness
  4. Subdivision + Weighted Normal
  5. Inset en bordes de cuello / mangas / bajo (ribete)
  6. Material tela blanca mate

Uso en Blender (con male_basemesh en escena):
  Text Editor > Open > tools/blender/create_realistic_tshirt.py > Run Script

O terminal:
  blender tu_archivo.blend --python tools/blender/create_realistic_tshirt.py
"""
from __future__ import annotations

import bpy
import bmesh
from mathutils import Vector

BODY_NAME = "male_basemesh"
SHIRT_NAME = "Tshirt_WIP"

# Ruta al GLB si el cuerpo no está en escena (ajusta si hace falta)
BODY_GLB = r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\avatars\male.glb"

SHRINK_OFFSET = 0.042
SOLIDIFY_THICK = 0.01
TORSO_EASE = 1.14


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return (
        Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners))),
        Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners))),
    )


def ensure_body() -> bpy.types.Object:
    body = bpy.data.objects.get(BODY_NAME)
    if body:
        return body
    bpy.ops.import_scene.gltf(filepath=BODY_GLB)
    meshes = [
        o
        for o in bpy.data.objects
        if o.type == "MESH" and "eye" not in o.name.lower()
    ]
    if not meshes:
        raise RuntimeError("No hay mesh de cuerpo tras importar GLB")
    body = max(meshes, key=lambda o: len(o.data.vertices))
    body.name = BODY_NAME
    return body


def remove_old() -> None:
    for name in (SHIRT_NAME, "tshirt_preview", "tshirt_preview.001", "tshirt_preview.002"):
        o = bpy.data.objects.get(name)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)


def prepare_body(body: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def make_grid_part(
    bm: bmesh.types.BMesh,
    width: float,
    height: float,
    depth: float,
    center: Vector,
    cuts_x: int,
    cuts_z: int,
) -> None:
    """Plano subdividido (en XZ), normal hacia +Y."""
    hw, hh = width * 0.5, height * 0.5
    res_x, res_z = cuts_x + 1, cuts_z + 1
    verts = []
    for iz in range(res_z):
        for ix in range(res_x):
            x = -hw + (width * ix / cuts_x)
            z = -hh + (height * iz / cuts_z)
            verts.append(bm.verts.new(center + Vector((x, 0.0, z))))
    for iz in range(cuts_z):
        for ix in range(cuts_x):
            i = iz * res_x + ix
            bm.faces.new((verts[i], verts[i + 1], verts[i + res_x + 1], verts[i + res_x]))


def create_tshirt_mesh(body: bpy.types.Object) -> bpy.types.Object:
    """Forma en T: panel torso + dos mangas (objeto nuevo)."""
    bmin, bmax = world_bbox(body)
    center = (bmin + bmax) * 0.5
    size = bmax - bmin
    h = size.z

    # Alturas polo manga corta
    z_hem = bmin.z + h * 0.40
    z_shoulder = bmin.z + h * 0.78
    z_top = bmin.z + h * 0.74
    torso_h = z_top - z_hem

    torso_w = size.x * TORSO_EASE * 0.52
    sleeve_w = size.x * TORSO_EASE * 0.22
    sleeve_h = h * 0.22
    depth_off = size.y * 0.52

    bm = bmesh.new()

    # Torso (frente del cuerpo, plano hacia +Y)
    torso_c = Vector((center.x, center.y + depth_off, (z_hem + z_top) * 0.5))
    make_grid_part(bm, torso_w * 2, torso_h, 0.01, torso_c, 8, 10)

    # Manga izquierda
    sl_c = Vector(
        (
            center.x - torso_w - sleeve_w * 0.5,
            center.y + depth_off,
            z_shoulder - sleeve_h * 0.35,
        )
    )
    make_grid_part(bm, sleeve_w, sleeve_h, 0.01, sl_c, 4, 3)

    # Manga derecha
    sr_c = Vector(
        (
            center.x + torso_w + sleeve_w * 0.5,
            center.y + depth_off,
            z_shoulder - sleeve_h * 0.35,
        )
    )
    make_grid_part(bm, sleeve_w, sleeve_h, 0.01, sr_c, 4, 3)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"{SHIRT_NAME}_mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(SHIRT_NAME, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def add_ribetes(obj: bpy.types.Object, body: bpy.types.Object) -> None:
    bmin, bmax = world_bbox(body)
    h = bmax.z - bmin.z
    neck_z = bmin.z + h * 0.73
    hem_z = bmin.z + h * 0.41
    sleeve_x = (bmax.x - bmin.x) * 0.19

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(obj.data)

    edges = []
    for e in bm.edges:
        v1, v2 = e.verts
        z = (v1.co.z + v2.co.z) * 0.5
        x = max(abs(v1.co.x), abs(v2.co.x))
        if z > neck_z or z < hem_z or (x > sleeve_x and z > hem_z + h * 0.08):
            edges.append(e)

    if edges:
        bmesh.ops.inset_edges(bm, edges=edges, thickness=0.007, depth=0.004)

    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def setup_modifiers(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    for m in list(shirt.modifiers):
        shirt.modifiers.remove(m)

    # Orden (arriba→abajo en pila = se aplica primero→último):
    # Shrinkwrap → Solidify → Subdiv → Weighted Normal
    sw = shirt.modifiers.new("ShrinkwrapFit", "SHRINKWRAP")
    sw.target = body
    # Blender 5+: PROJECT + use_negative_direction_y no disponible
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.wrap_mode = "ABOVE_SURFACE"
    sw.offset = SHRINK_OFFSET

    sol = shirt.modifiers.new("SolidifyFabric", "SOLIDIFY")
    sol.thickness = SOLIDIFY_THICK
    sol.offset = 1.0
    sol.use_even_offset = True
    sol.use_rim = True

    sub = shirt.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2

    shirt.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL").keep_sharp = True


def setup_material(shirt: bpy.types.Object) -> None:
    mat = bpy.data.materials.new(name="Tshirt_Fabric_White")
    mat.use_nodes = True
    mat.use_backface_culling = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.96, 0.96, 0.94, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.8
        spec = bsdf.inputs.get("Specular IOR Level") or bsdf.inputs.get("Specular")
        if spec:
            spec.default_value = 0.2
        sub = bsdf.inputs.get("Subsurface Weight") or bsdf.inputs.get("Subsurface")
        if sub:
            sub.default_value = 0.1
    shirt.data.materials.clear()
    shirt.data.materials.append(mat)
    for p in shirt.data.polygons:
        p.use_smooth = True
    shirt.data.shade_smooth()


def main() -> None:
    remove_old()
    body = ensure_body()
    prepare_body(body)
    shirt = create_tshirt_mesh(body)
    setup_modifiers(shirt, body)
    add_ribetes(shirt, body)
    setup_material(shirt)

    body.hide_viewport = False
    body.hide_render = False

    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt

    print(f"✅ {SHIRT_NAME} lista")
    print("   Malla nueva en T + Shrinkwrap PROJECT offset", SHRINK_OFFSET)
    print("   male_basemesh oculto (sin z-fighting en viewport)")
    print("   Opcional: Cloth sim 5–10 frames y Apply para pliegues")


if __name__ == "__main__":
    main()
