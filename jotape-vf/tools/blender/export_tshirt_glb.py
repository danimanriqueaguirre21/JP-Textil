"""
Exporta camiseta 3D (torso + mangas + cuello) como una sola malla GLB.
Uso: blender --background --python tools/blender/export_tshirt_glb.py
"""
import os
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

import bpy

from _garment_common import (
    add_box,
    clear_scene,
    create_fabric_material,
    finalize_and_export,
    join_objects,
    project_garments_dir,
)

clear_scene()

# Blender Z = alto. scale = (ancho X, profundidad Y, alto Z)
torso = add_box((0.42, 0.22, 0.5), (0.0, 0.0, 0.02), name="torso")
sleeve_l = add_box((0.18, 0.14, 0.14), (-0.34, 0.0, 0.22), name="sleeve_l")
sleeve_r = add_box((0.18, 0.14, 0.14), (0.34, 0.0, 0.22), name="sleeve_r")
collar = add_box((0.2, 0.1, 0.06), (0.0, 0.0, 0.3), name="collar")

tshirt = join_objects([torso, sleeve_l, sleeve_r, collar])
tshirt.name = "tshirt"

fabric = create_fabric_material("tshirt_fabric", (0.95, 0.95, 0.95), roughness=0.88)
output_path = project_garments_dir("tshirt.glb")
finalize_and_export(tshirt, fabric, output_path)
