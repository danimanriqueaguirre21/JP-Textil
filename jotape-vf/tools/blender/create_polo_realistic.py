"""
Polo manga corta realista — prenda 3D separada del maniquí.

Requisitos: maniquí (mesh) seleccionado o male_basemesh en escena.

Pipeline:
  1. Malla en T (torso + mangas cortas) separada del cuerpo
  2. Shrinkwrap con holgura (no pegada a la piel)
  3. Solidify (grosor de tela)
  4. Cloth + colisión con cuerpo
  5. Subdivisión, smooth, UV, material algodón procedural
  6. Decimate opcional para GLB

Uso:
  blender escena.blend --python tools/blender/create_polo_realistic.py

Desde MCP:
  runpy.run_path(..., run_name='__main__')
"""
from __future__ import annotations

import bpy
import bmesh
from mathutils import Vector

SHIRT_NAME = "Polo_Realistic"
EXPORT_PATH = (
    r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\clothing"
    r"\polo-realistic-wip.glb"
)

# Holgura y grosor (metros aprox. en escena del avatar)
SHRINK_OFFSET = 0.038
SHRINK_ARMS = 0.048
SHRINK_BACK = 0.044
SOLIDIFY_MM = 0.01
CLOTH_FRAMES = 18
TARGET_MAX_VERTS = 22000
MAX_VERT_DIST_FROM_BODY = 0.55


def world_bbox(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return (
        Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners))),
        Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners))),
    )


def get_body() -> bpy.types.Object:
    obj = bpy.context.active_object
    if obj and obj.type == "MESH" and "eye" not in obj.name.lower():
        return obj
    for o in bpy.context.selected_objects:
        if o.type == "MESH" and "eye" not in o.name.lower():
            return o
    body = bpy.data.objects.get("male_basemesh")
    if body and body.type == "MESH":
        return body
    meshes = [o for o in bpy.data.objects if o.type == "MESH" and "eye" not in o.name.lower()]
    if not meshes:
        raise RuntimeError("No hay maniquí mesh en la escena")
    return max(meshes, key=lambda o: len(o.data.vertices))


def remove_old_garments() -> None:
    for obj in list(bpy.data.objects):
        n = obj.name
        if n in {SHIRT_NAME, "Tshirt_WIP", "Tshirt_Final"} or n.lower().startswith("polo_"):
            bpy.data.objects.remove(obj, do_unlink=True)


def make_grid(
    bm: bmesh.types.BMesh,
    width: float,
    height: float,
    center: Vector,
    cuts_x: int,
    cuts_z: int,
) -> None:
    hw, hh = width * 0.5, height * 0.5
    rx, rz = cuts_x + 1, cuts_z + 1
    verts = []
    for iz in range(rz):
        for ix in range(rx):
            x = -hw + (width * ix / max(cuts_x, 1))
            z = -hh + (height * iz / max(cuts_z, 1))
            verts.append(bm.verts.new(center + Vector((x, 0.0, z))))
    for iz in range(cuts_z):
        for ix in range(cuts_x):
            i = iz * rx + ix
            bm.faces.new((verts[i], verts[i + 1], verts[i + rx + 1], verts[i + rx]))


def create_polo_base(body: bpy.types.Object) -> bpy.types.Object:
    """Malla en T: panel torso + mangas cortas (objeto nuevo)."""
    bmin, bmax = world_bbox(body)
    center = (bmin + bmax) * 0.5
    size = bmax - bmin
    h = size.z

    z_hem = bmin.z + h * 0.40
    z_shoulder = bmin.z + h * 0.76
    z_top = bmin.z + h * 0.73
    torso_h = z_top - z_hem
    ease = 1.16

    torso_w = size.x * ease * 0.56
    sleeve_w = size.x * ease * 0.30
    sleeve_h = h * 0.24
    depth = max(size.y * 0.72, 0.06)

    bm = bmesh.new()
    mid_z = (z_hem + z_top) * 0.5
    # Frente + espalda (evita huecos en la espalda)
    make_grid(bm, torso_w * 2.0, torso_h, Vector((center.x, center.y + depth * 0.5, mid_z)), 14, 16)
    make_grid(bm, torso_w * 2.05, torso_h * 1.02, Vector((center.x, center.y - depth * 0.52, mid_z)), 14, 16)

    # Mangas alineadas al brazo en T-pose (extensión en X, no colgando en diagonal)
    sleeve_len = size.x * ease * 0.36
    arm_z = z_shoulder - h * 0.04
    for sign in (-1, 1):
        sx = center.x + sign * (torso_w + sleeve_len * 0.48)
        for dy in (depth * 0.48, -depth * 0.52):
            make_grid(
                bm,
                sleeve_len * 1.15,
                h * 0.14,
                Vector((sx, center.y + dy, arm_z)),
                10,
                4,
            )
    # Puente espalda (cierra hueco central superior)
    bridge_w = torso_w * 0.55
    bridge_h = h * 0.12
    bridge_z = z_shoulder - h * 0.02
    make_grid(
        bm,
        bridge_w * 2,
        bridge_h,
        Vector((center.x, center.y - depth * 0.48, bridge_z)),
        6,
        3,
    )

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.038)
    try:
        bmesh.ops.holes_fill(bm, sides=8)
    except Exception:
        pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(f"{SHIRT_NAME}_mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(SHIRT_NAME, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def vertex_group_arms_back(shirt: bpy.types.Object, body: bpy.types.Object) -> tuple[str, str]:
    bmin, bmax = world_bbox(body)
    bc = (bmin + bmax) * 0.5
    arm_x = (bmax.x - bmin.x) * 0.32
    back_y = bc.y - (bmax.y - bmin.y) * 0.1

    for nm in ("VG_Arms", "VG_Back"):
        if nm in shirt.vertex_groups:
            shirt.vertex_groups.remove(shirt.vertex_groups[nm])

    vg_arm = shirt.vertex_groups.new(name="VG_Arms")
    vg_back = shirt.vertex_groups.new(name="VG_Back")
    for v in shirt.data.vertices:
        w = shirt.matrix_world @ v.co
        if abs(w.x - bc.x) > arm_x and bmin.z + (bmax.z - bmin.z) * 0.36 < w.z < bmax.z - (bmax.z - bmin.z) * 0.1:
            vg_arm.add([v.index], 1.0, "REPLACE")
        if w.y < back_y and bmin.z + (bmax.z - bmin.z) * 0.34 < w.z < bmax.z - (bmax.z - bmin.z) * 0.08:
            vg_back.add([v.index], 1.0, "REPLACE")
    return "VG_Arms", "VG_Back"


def trim_neck_and_hem(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    bmin, bmax = world_bbox(body)
    h = bmax.z - bmin.z
    neck_z = bmin.z + h * 0.725
    hem_z = bmin.z + h * 0.395

    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(shirt.data)
    bm.verts.ensure_lookup_table()
    to_del = []
    for v in bm.verts:
        w = shirt.matrix_world @ v.co
        if w.z > neck_z or w.z < hem_z:
            to_del.append(v)
    if to_del:
        bmesh.ops.delete(bm, geom=to_del, context="VERTS")
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    bmesh.update_edit_mesh(shirt.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def add_pin_group(shirt: bpy.types.Object, body: bpy.types.Object) -> str:
    bmin, bmax = world_bbox(body)
    h = bmax.z - bmin.z
    pin_z = bmin.z + h * 0.62
    vg_name = "Pin"
    if vg_name in shirt.vertex_groups:
        shirt.vertex_groups.remove(shirt.vertex_groups[vg_name])
    vg = shirt.vertex_groups.new(name=vg_name)
    mesh = shirt.data
    for v in mesh.vertices:
        w = shirt.matrix_world @ v.co
        if w.z >= pin_z:
            vg.add([v.index], 1.0, "REPLACE")
        elif w.z >= pin_z - h * 0.06:
            vg.add([v.index], 0.5, "REPLACE")
    return vg_name


def setup_body_collision(body: bpy.types.Object) -> None:
    for m in list(body.modifiers):
        if m.type == "COLLISION":
            body.modifiers.remove(m)
    col = body.modifiers.new("BodyCollision", "COLLISION")
    col.settings.thickness_outer = 0.025
    col.settings.thickness_inner = 0.01
    col.settings.cloth_friction = 5.0
    col.settings.use_culling = False


def setup_cloth(shirt: bpy.types.Object, pin_group: str) -> bpy.types.ClothModifier:
    for m in list(shirt.modifiers):
        if m.type == "CLOTH":
            shirt.modifiers.remove(m)
    cloth = shirt.modifiers.new("ClothDrape", "CLOTH")
    cs = cloth.settings
    cs.quality = 5
    cs.mass = 0.32
    cs.air_damping = 2.5
    cs.bending_stiffness = 0.85
    cs.tension_stiffness = 18.0
    cs.compression_stiffness = 18.0
    cs.use_pressure = False

    if hasattr(cs, "vertex_group_mass"):
        cs.vertex_group_mass = pin_group

    cc = cloth.collision_settings
    cc.use_self_collision = True
    cc.self_friction = 5.0
    cc.self_distance_min = 0.008
    cc.collision_quality = 4
    cc.distance_min = 0.012
    cc.impulse_clamp = 0.25

    if hasattr(cloth, "vertex_group_pin"):
        cloth.vertex_group_pin = pin_group
    return cloth


def bake_cloth_sim(scene: bpy.types.Scene, frames: int) -> None:
    scene.frame_start = 1
    scene.frame_end = frames
    scene.frame_current = 1
    for f in range(1, frames + 1):
        scene.frame_set(f)
        bpy.context.view_layer.update()
        for _ in range(2):
            bpy.context.view_layer.update()


def remove_spike_verts(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    """Elimina vértices que la simulación lanzó lejos del maniquí."""
    bmin, bmax = world_bbox(body)
    center = (bmin + bmax) * 0.5
    max_r = max(bmax.x - bmin.x, bmax.y - bmin.y, bmax.z - bmin.z) * MAX_VERT_DIST_FROM_BODY

    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(shirt.data)
    bm.verts.ensure_lookup_table()
    to_del = []
    for v in bm.verts:
        w = shirt.matrix_world @ v.co
        if (w - center).length > max_r:
            to_del.append(v)
    if to_del:
        bmesh.ops.delete(bm, geom=to_del, context="VERTS")
    bmesh.update_edit_mesh(shirt.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def apply_modifier_stack(shirt: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    for mod in list(shirt.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError as e:
            print(f"  skip apply {mod.name}: {e}")


def optimize_for_export(shirt: bpy.types.Object) -> None:
    n = len(shirt.data.vertices)
    if n <= TARGET_MAX_VERTS:
        return
    ratio = TARGET_MAX_VERTS / n
    dec = shirt.modifiers.new("DecimateExport", "DECIMATE")
    dec.ratio = max(0.15, min(0.85, ratio))
    dec.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=dec.name)


def create_cotton_material(name: str = "Cotton_Polo") -> bpy.types.Material:
    mat = bpy.data.materials.get(name)
    if mat:
        bpy.data.materials.remove(mat)
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (600, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (320, 0)
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-800, 0)
    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-600, 0)
    mapping.inputs["Scale"].default_value = (8.0, 8.0, 8.0)
    links.new(tex_coord.outputs["UV"], mapping.inputs["Vector"])

    weave = nodes.new("ShaderNodeTexNoise")
    weave.location = (-400, 120)
    weave.inputs["Scale"].default_value = 180.0
    weave.inputs["Detail"].default_value = 8.0
    weave.inputs["Roughness"].default_value = 0.55
    links.new(mapping.outputs["Vector"], weave.inputs["Vector"])

    fine = nodes.new("ShaderNodeTexNoise")
    fine.location = (-400, -80)
    fine.inputs["Scale"].default_value = 45.0
    fine.inputs["Detail"].default_value = 4.0
    links.new(mapping.outputs["Vector"], fine.inputs["Vector"])

    mix = nodes.new("ShaderNodeMixRGB")
    mix.location = (-180, 40)
    mix.blend_type = "MULTIPLY"
    mix.inputs["Fac"].default_value = 0.35
    mix.inputs["Color1"].default_value = (0.94, 0.93, 0.90, 1.0)
    mix2 = nodes.new("ShaderNodeMixRGB")
    mix2.location = (-280, -60)
    mix2.blend_type = "OVERLAY"
    mix2.inputs["Fac"].default_value = 0.25
    mix2.inputs["Color1"].default_value = (0.94, 0.93, 0.90, 1.0)
    links.new(weave.outputs["Fac"], mix2.inputs["Color2"])
    links.new(mix2.outputs["Color"], mix.inputs["Color1"])
    links.new(fine.outputs["Fac"], mix.inputs["Color2"])

    links.new(mix.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.78
    spec = bsdf.inputs.get("Specular IOR Level") or bsdf.inputs.get("Specular")
    if spec:
        spec.default_value = 0.18
    subs = bsdf.inputs.get("Subsurface Weight") or bsdf.inputs.get("Subsurface")
    if subs:
        subs.default_value = 0.06

    bump = nodes.new("ShaderNodeBump")
    bump.location = (80, -160)
    bump.inputs["Strength"].default_value = 0.12
    links.new(fine.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    mat.use_backface_culling = False
    return mat


def auto_uv(shirt: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(
        angle_limit=66.0,
        island_margin=0.02,
        area_weight=0.0,
        correct_aspect=True,
        scale_to_bounds=False,
    )
    bpy.ops.object.mode_set(mode="OBJECT")


def weld_and_fill(shirt: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    try:
        bpy.ops.mesh.fill_holes(sides=0)
    except Exception:
        pass
    bpy.ops.object.mode_set(mode="OBJECT")


def setup_pre_cloth_modifiers(shirt: bpy.types.Object, body: bpy.types.Object) -> None:
    for m in list(shirt.modifiers):
        shirt.modifiers.remove(m)

    weld_and_fill(shirt)

    sol = shirt.modifiers.new("SolidifyFabric", "SOLIDIFY")
    sol.thickness = SOLIDIFY_MM
    sol.offset = 1.0
    sol.use_even_offset = True
    sol.use_rim = True

    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    bpy.ops.object.modifier_apply(modifier=sol.name)

    sw = shirt.modifiers.new("ShrinkwrapFit", "SHRINKWRAP")
    sw.target = body
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.wrap_mode = "ABOVE_SURFACE"
    sw.offset = SHRINK_OFFSET
    bpy.ops.object.modifier_apply(modifier=sw.name)


def setup_post_cloth_modifiers(shirt: bpy.types.Object) -> None:
    sub = shirt.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    shirt.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    bpy.ops.object.shade_smooth()
    for p in shirt.data.polygons:
        p.use_smooth = True


def export_glb(shirt: bpy.types.Object, path: str) -> None:
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
        export_image_format="AUTO",
    )


def main() -> None:
    remove_old_garments()
    body = get_body()
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    shirt = create_polo_base(body)
    trim_neck_and_hem(shirt, body)
    setup_pre_cloth_modifiers(shirt, body)

    pin_group = add_pin_group(shirt, body)
    setup_body_collision(body)
    setup_cloth(shirt, pin_group)

    scene = bpy.context.scene
    if scene.use_gravity is False:
        scene.use_gravity = True
    bake_cloth_sim(scene, CLOTH_FRAMES)

    apply_modifier_stack(shirt)
    bpy.ops.object.select_all(action="DESELECT")
    shirt.select_set(True)
    bpy.context.view_layer.objects.active = shirt
    remove_spike_verts(shirt, body)
    trim_neck_and_hem(shirt, body)

    vg_arm, vg_back = vertex_group_arms_back(shirt, body)

    sw_a = shirt.modifiers.new("FitArms", "SHRINKWRAP")
    sw_a.target = body
    sw_a.wrap_method = "NEAREST_SURFACEPOINT"
    sw_a.wrap_mode = "ABOVE_SURFACE"
    sw_a.offset = SHRINK_ARMS
    if hasattr(sw_a, "vertex_group"):
        sw_a.vertex_group = vg_arm
    try:
        bpy.ops.object.modifier_apply(modifier=sw_a.name)
    except Exception:
        shirt.modifiers.remove(sw_a)

    sw_b = shirt.modifiers.new("FitBack", "SHRINKWRAP")
    sw_b.target = body
    sw_b.wrap_method = "NEAREST_SURFACEPOINT"
    sw_b.wrap_mode = "ABOVE_SURFACE"
    sw_b.offset = SHRINK_BACK
    if hasattr(sw_b, "vertex_group"):
        sw_b.vertex_group = vg_back
    try:
        bpy.ops.object.modifier_apply(modifier=sw_b.name)
    except Exception:
        shirt.modifiers.remove(sw_b)

    setup_post_cloth_modifiers(shirt)
    apply_modifier_stack(shirt)

    auto_uv(shirt)
    mat = create_cotton_material()
    shirt.data.materials.clear()
    shirt.data.materials.append(mat)

    optimize_for_export(shirt)
    apply_modifier_stack(shirt)

    shirt.parent = body
    body.display_type = "WIRE"
    shirt.display_type = "SOLID"

    export_glb(shirt, EXPORT_PATH)

    bb = world_bbox(shirt)
    print(f"✅ {SHIRT_NAME} listo")
    print(f"   Vértices: {len(shirt.data.vertices)}")
    print(f"   BBox Z: {bb[0].z:.2f} – {bb[1].z:.2f}")
    print(f"   Export: {EXPORT_PATH}")
    print("   Revisa en Blender (frente/espalda). Si el drapeado es poco, sube CLOTH_FRAMES.")


if __name__ == "__main__":
    main()
