"""

Exporta shorts 3D como una sola pieza.

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
    project_garments_dir,
)

clear_scene()

shorts = add_box((0.52, 0.28, 0.4), (0.0, 0.0, 0.0), name="shorts")

fabric = create_fabric_material("shorts_fabric", (0.95, 0.95, 0.95), roughness=0.9)
output_path = project_garments_dir("shorts.glb")
finalize_and_export(shorts, fabric, output_path)
