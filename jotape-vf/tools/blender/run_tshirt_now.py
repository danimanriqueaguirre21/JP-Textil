"""
Pega y ejecuta ESTE archivo en Blender (Scripting > Open > Run Script).
Crea Tshirt_Final visible junto a male_basemesh.
"""
import bpy
import bmesh
from mathutils import Vector

SHIRT = "Tshirt_Final"
BODY = "male_basemesh"
GLB = r"C:\Users\Asus\Desktop\Jpe\jotape-vf\frontend\public\models\avatars\male.glb"

# --- cuerpo ---
body = bpy.data.objects.get(BODY)
if not body:
    bpy.ops.import_scene.gltf(filepath=GLB)
    body = max(
        (o for o in bpy.data.objects if o.type == "MESH" and "eye" not in o.name.lower()),
        key=lambda o: len(o.data.vertices),
    )
    body.name = BODY

# borrar camiseta vieja
for n in (SHIRT, "tshirt_preview", "tshirt_preview.001"):
    o = bpy.data.objects.get(n)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

# bbox cuerpo
bb = [body.matrix_world @ Vector(c) for c in body.bound_box]
bmin = Vector((min(v.x for v in bb), min(v.y for v in bb), min(v.z for v in bb)))
bmax = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
center = (bmin + bmax) * 0.5
size = bmax - bmin

# --- malla nueva (cubo holgado, NO duplicar cuerpo) ---
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
sx, sy, h = size.x, size.y, size.z
cx, cy = center.x, center.y
ease = 1.14
z0, z1 = bmin.z + h * 0.40, bmin.z + h * 0.80
x0, x1 = cx - sx * 0.56 * ease, cx + sx * 0.56 * ease
y0, y1 = cy + sy * 0.05, cy + sy * 0.42
for v in bm.verts:
    v.co.x = x0 + (v.co.x + 0.5) * (x1 - x0)
    v.co.y = y0 + (v.co.y + 0.5) * (y1 - y0)
    v.co.z = z0 + (v.co.z + 0.5) * (z1 - z0)
bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=3, use_grid_fill=True)

mesh = bpy.data.meshes.new(SHIRT + "_mesh")
bm.to_mesh(mesh)
bm.free()

shirt = bpy.data.objects.new(SHIRT, mesh)
# Asegurar que está en la colección activa
col = bpy.context.view_layer.active_layer_collection.collection
col.objects.link(shirt)

# --- modificadores ---
sw = shirt.modifiers.new("Shrinkwrap", "SHRINKWRAP")
sw.target = body
sw.wrap_method = "NEAREST_SURFACEPOINT"
sw.wrap_mode = "ABOVE_SURFACE"
sw.offset = 0.045

sol = shirt.modifiers.new("Solidify", "SOLIDIFY")
sol.thickness = 0.01
sol.offset = 1.0
sol.use_even_offset = True

shirt.modifiers.new("Subdivision", "SUBSURF").levels = 2

# --- material blanco visible ---
mat = bpy.data.materials.new("Tshirt_White")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (1, 1, 1, 1)
    bsdf.inputs["Roughness"].default_value = 0.85
shirt.data.materials.append(mat)

# --- visibilidad ---
body.hide_viewport = False
shirt.hide_viewport = False
shirt.hide_set(False)
body.hide_set(False)

bpy.ops.object.select_all(action="DESELECT")
shirt.select_set(True)
bpy.context.view_layer.objects.active = shirt

# encuadre
for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        for space in area.spaces:
            if space.type == "VIEW_3D":
                space.shading.type = "SOLID"
                space.shading.color_type = "MATERIAL"
        break

print("=" * 50)
print("LISTO: busca", SHIRT, "en el Outliner")
print("Verts:", len(shirt.data.vertices))
print("Si no la ves: Outliner > ojo junto a", SHIRT)
print("=" * 50)
