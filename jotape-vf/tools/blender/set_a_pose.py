"""
A-Pose calibrada contra male_basemesh (CC_Base armature).

Solo huesos; no modifica mallas.
Calibración por posición relativa de manos respecto al centro del cuerpo.

Uso:
  blender escena.blend --python tools/blender/set_a_pose.py
  blender escena.blend --python tools/blender/set_a_pose.py -- --legs-only
"""
from __future__ import annotations

import math
import sys

import bpy
from mathutils import Euler, Vector

ARMATURE_NAME = "Armature"
REF_MESH = "male_basemesh"

# Mejor ajuste encontrado (rig CC ≠ proporciones dan283)
POSE = {
    # Abrir hombros en CC: menos |Z| en clavícula/brazo (más |Z| mete brazos al torso)
    "CC_Base_L_Clavicle": (0.0, 0.0, -30.0),
    "CC_Base_R_Clavicle": (0.0, 0.0, 30.0),
    "CC_Base_L_Upperarm": (0.0, 0.0, -17.0),
    "CC_Base_R_Upperarm": (0.0, 0.0, 17.0),
    "CC_Base_L_Forearm": (0.0, -15.0, 0.0),
    "CC_Base_R_Forearm": (0.0, 15.0, 0.0),
    "CC_Base_L_Hand": (0.0, 0.0, 0.0),
    "CC_Base_R_Hand": (0.0, 0.0, 0.0),
    "CC_Base_L_Thigh": (0.0, 0.0, 6.0),
    "CC_Base_R_Thigh": (0.0, 0.0, -6.0),
}

LEG_POSE = {
    "CC_Base_L_Thigh": (0.0, 0.0, 6.0),
    "CC_Base_R_Thigh": (0.0, 0.0, -6.0),
}

LEG_TWIST_ZERO = (
    "CC_Base_L_ThighTwist01",
    "CC_Base_L_ThighTwist02",
    "CC_Base_R_ThighTwist01",
    "CC_Base_R_ThighTwist02",
    "CC_Base_L_KneeShareBone",
    "CC_Base_R_KneeShareBone",
)

TWIST_ZERO = tuple(
    n
    for n in (
        "CC_Base_L_ForearmTwist01",
        "CC_Base_L_ForearmTwist02",
        "CC_Base_R_ForearmTwist01",
        "CC_Base_R_ForearmTwist02",
        "CC_Base_L_ElbowShareBone",
        "CC_Base_R_ElbowShareBone",
        "CC_Base_L_UpperarmTwist01",
        "CC_Base_L_UpperarmTwist02",
        "CC_Base_R_UpperarmTwist01",
        "CC_Base_R_UpperarmTwist02",
    )
)


def get_armature() -> bpy.types.Object:
    for name in (ARMATURE_NAME, "Armature"):
        o = bpy.data.objects.get(name)
        if o and o.type == "ARMATURE":
            return o
    for o in bpy.data.objects:
        if o.type == "ARMATURE":
            return o
    raise RuntimeError("No hay armature en la escena")


def body_center(body: bpy.types.Object) -> Vector:
    mw = body.matrix_world
    verts = [mw @ v.co for v in body.data.vertices]
    return Vector(
        (
            sum(v.x for v in verts) / len(verts),
            sum(v.y for v in verts) / len(verts),
            sum(v.z for v in verts) / len(verts),
        )
    )


def hand_targets_from_ref(ref: bpy.types.Object, bc: Vector) -> dict[str, Vector]:
    """Posición de manos relativa al centro del cuerpo CC (desde ref dan283)."""
    mw = ref.matrix_world
    verts = [mw @ v.co for v in ref.data.vertices]
    rc = Vector(
        (
            sum(v.x for v in verts) / len(verts),
            sum(v.y for v in verts) / len(verts),
            sum(v.z for v in verts) / len(verts),
        )
    )
    h = max(v.z for v in verts) - min(v.z for v in verts)

    def pick(sign: int) -> Vector:
        if sign < 0:
            ps = [v for v in verts if v.x < rc.x - 0.15 and v.z < rc.z - h * 0.05]
        else:
            ps = [v for v in verts if v.x > rc.x + 0.15 and v.z < rc.z - h * 0.05]
        p = sum(ps, Vector()) / len(ps)
        # CC: mano L en +X, mano R en -X
        rel = Vector((p.x - rc.x, p.y - rc.y, p.z - rc.z))
        return Vector((abs(rel.x), rel.y, rel.z)) if sign < 0 else Vector((-abs(rel.x), rel.y, rel.z))

    return {"L": pick(-1), "R": pick(1)}


def apply_pose(arm: bpy.types.Object, pose: dict[str, tuple[float, float, float]]) -> None:
    if bpy.context.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")

    for name in TWIST_ZERO:
        pb = arm.pose.bones.get(name)
        if pb:
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = (1.0, 0.0, 0.0, 0.0)

    for name, euler_deg in pose.items():
        pb = arm.pose.bones.get(name)
        if not pb:
            continue
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = Euler(
            tuple(math.radians(x) for x in euler_deg),
            "XYZ",
        )
    bpy.context.view_layer.update()


def apply_legs_only(arm: bpy.types.Object) -> None:
    """Solo piernas (±6°). No toca brazos ni clavículas."""
    if bpy.context.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")

    for name in LEG_TWIST_ZERO:
        pb = arm.pose.bones.get(name)
        if pb:
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = (1.0, 0.0, 0.0, 0.0)

    for name, euler_deg in LEG_POSE.items():
        pb = arm.pose.bones.get(name)
        if not pb:
            continue
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = Euler(
            tuple(math.radians(x) for x in euler_deg),
            "XYZ",
        )
    bpy.context.view_layer.update()


def optimize_against_ref(arm: bpy.types.Object, body: bpy.types.Object, ref: bpy.types.Object) -> None:
    """Búsqueda gruesa si hay male_basemesh en escena."""
    bc = body_center(body)
    targets = hand_targets_from_ref(ref, bc)

    def set_b(n: str, e: tuple[float, float, float]) -> None:
        pb = arm.pose.bones.get(n)
        if pb:
            pb.rotation_mode = "XYZ"
            pb.rotation_euler = Euler(tuple(math.radians(x) for x in e), "XYZ")

    def hrel(side: str) -> Vector:
        pb = arm.pose.bones[f"CC_Base_{side}_Hand"]
        p = arm.matrix_world @ pb.matrix @ Vector((0.0, 0.0, 0.0))
        return Vector((p.x - bc.x, p.y - bc.y, p.z - bc.z))

    def score() -> float:
        return (hrel("L") - targets["L"]).length + (hrel("R") - targets["R"]).length

    best = (999.0, POSE)
    for clz in range(-35, 36, 5):
        for uz in range(-42, -18, 2):
            for fy in range(-75, 76, 15):
                for pb in arm.pose.bones:
                    if "Twist" in pb.name or "Share" in pb.name:
                        pb.rotation_mode = "QUATERNION"
                        pb.rotation_quaternion = (1.0, 0.0, 0.0, 0.0)
                trial = {
                    "CC_Base_L_Clavicle": (0.0, 0.0, float(clz)),
                    "CC_Base_R_Clavicle": (0.0, 0.0, float(-clz)),
                    "CC_Base_L_Upperarm": (0.0, 0.0, float(uz)),
                    "CC_Base_R_Upperarm": (0.0, 0.0, float(-uz)),
                    "CC_Base_L_Forearm": (0.0, float(fy), 0.0),
                    "CC_Base_R_Forearm": (0.0, float(-fy), 0.0),
                    "CC_Base_L_Hand": (0.0, 0.0, 0.0),
                    "CC_Base_R_Hand": (0.0, 0.0, 0.0),
                    "CC_Base_L_Thigh": (0.0, 0.0, 6.0),
                    "CC_Base_R_Thigh": (0.0, 0.0, -6.0),
                }
                for k, v in trial.items():
                    set_b(k, v)
                bpy.context.view_layer.update()
                sc = score()
                if sc < best[0]:
                    best = (sc, trial)

    apply_pose(arm, best[1])
    print(f"   Optimizado score={best[0]:.3f}")


def main() -> None:
    arm = get_armature()
    legs_only = "--legs-only" in sys.argv

    if legs_only:
        apply_legs_only(arm)
        print("✅ Piernas naturales (±6°). Brazos sin cambios.")
        print("   Solo armature | Mallas sin cambios")
        return

    body = bpy.data.objects.get("CC_Base_Body")
    ref = bpy.data.objects.get(REF_MESH)

    if body and ref:
        optimize_against_ref(arm, body, ref)
        bc = body_center(body)
        hl = arm.matrix_world @ arm.pose.bones["CC_Base_L_Hand"].matrix @ Vector((0, 0, 0))
        print("✅ A-Pose calibrada vs male_basemesh")
        print(f"   Mano L rel Z: {hl.z - bc.z:.2f} (ref ~ -0.64)")
    else:
        apply_pose(arm, POSE)
        print("✅ A-Pose aplicada (valores por defecto)")

    print("   Solo armature | Mallas sin cambios")


if __name__ == "__main__":
    main()
