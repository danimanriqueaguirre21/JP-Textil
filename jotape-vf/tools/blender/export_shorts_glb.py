"""
Exporta shorts 3D (cintura + dos piernas) como una sola malla GLB.
Uso: blender --background --python tools/blender/export_shorts_glb.py
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

waist = add_box((0.46, 0.26, 0.14), (0.0, 0.0, 0.18), name="waist")
leg_l = add_box((0.2, 0.22, 0.36), (-0.13, 0.0, -0.06), name="leg_l")
leg_r = add_box((0.2, 0.22, 0.36), (0.13, 0.0, -0.06), name="leg_r")

shorts = join_objects([waist, leg_l, leg_r])
shorts.name = "shorts"

fabric = create_fabric_material("shorts_fabric", (0.94, 0.94, 0.94), roughness=0.88)
output_path = project_garments_dir("shorts.glb")
finalize_and_export(shorts, fabric, output_path)
