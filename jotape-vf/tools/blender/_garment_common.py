"""Utilidades compartidas para exportar prendas GLB desde Blender."""

import os



import bpy





def project_garments_dir(filename: str) -> str:

    script_dir = os.path.dirname(os.path.abspath(__file__))

    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    out_dir = os.path.join(project_root, "frontend", "public", "models", "garments")

    os.makedirs(out_dir, exist_ok=True)

    return os.path.join(out_dir, filename)





def clear_scene() -> None:

    bpy.ops.object.select_all(action="SELECT")

    bpy.ops.object.delete()





def create_fabric_material(name: str, rgb: tuple[float, float, float], roughness: float = 0.9):

    mat = bpy.data.materials.new(name=name)

    mat.use_nodes = True

    bsdf = mat.node_tree.nodes["Principled BSDF"]

    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)

    bsdf.inputs["Roughness"].default_value = roughness

    bsdf.inputs["Metallic"].default_value = 0.0

    mat.use_backface_culling = False

    return mat





def add_box(

    scale: tuple[float, float, float],

    location: tuple[float, float, float] = (0.0, 0.0, 0.0),

    name: str = "part",

):

    """Cubo escalado (Blender Z arriba). scale = (ancho X, profundidad Y, alto Z)."""

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)

    obj = bpy.context.active_object

    obj.name = name

    obj.scale = scale

    bpy.ops.object.transform_apply(scale=True)

    return obj





def center_object_at_origin(obj) -> None:

    bpy.ops.object.select_all(action="DESELECT")

    obj.select_set(True)

    bpy.context.view_layer.objects.active = obj

    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")

    loc = obj.matrix_world.translation.copy()

    bpy.ops.transform.translate(value=(-loc.x, -loc.y, -loc.z))

    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)





def join_objects(objects: list) -> bpy.types.Object:

    bpy.ops.object.select_all(action="DESELECT")

    for obj in objects:

        obj.select_set(True)

    bpy.context.view_layer.objects.active = objects[0]

    bpy.ops.object.join()

    merged = bpy.context.active_object

    merged.name = objects[0].name

    return merged





def finalize_and_export(obj, material, output_path: str) -> None:

    center_object_at_origin(obj)

    obj.data.materials.clear()

    obj.data.materials.append(material)

    obj.show_wire = False

    obj.display_type = "SOLID"



    bpy.ops.object.select_all(action="DESELECT")

    obj.select_set(True)

    bpy.context.view_layer.objects.active = obj



    bpy.ops.object.mode_set(mode="EDIT")

    bpy.ops.mesh.select_all(action="SELECT")

    bpy.ops.mesh.normals_make_consistent(inside=False)

    bpy.ops.object.mode_set(mode="OBJECT")



    bevel = obj.modifiers.new(name="Bevel", type="BEVEL")

    bevel.width = 0.006

    bevel.segments = 2

    bpy.ops.object.modifier_apply(modifier="Bevel")

    bpy.ops.object.shade_smooth()



    bpy.ops.export_scene.gltf(

        filepath=output_path,

        export_format="GLB",

        use_selection=True,

        export_apply=True,

        export_normals=True,

        export_materials="EXPORT",

        export_cameras=False,

        export_lights=False,

    )

    print(f"✅ Exported to: {output_path}")


