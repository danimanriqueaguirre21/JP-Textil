"""
Exporta camiseta 3D como una sola pieza (sin huecos entre torso y mangas).
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
    project_garments_dir,
)

clear_scene()

# Una sola malla: ancho incluye mangas, alto = torso+cuello
tshirt = add_box((0.72, 0.26, 0.58), (0.0, 0.0, 0.0), name="tshirt")

fabric = create_fabric_material("tshirt_fabric", (0.95, 0.95, 0.95), roughness=0.9)
output_path = project_garments_dir("tshirt.glb")
finalize_and_export(tshirt, fabric, output_path)
