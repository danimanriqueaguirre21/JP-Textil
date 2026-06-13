"""
Bake shape keys vf_* en CC_Base_Body para exportar con morph targets reales.

Requiere escena Character Creator con CC_Base_Body y shape keys de volumen corporal
(o crea deltas vacíos como placeholder para sustituir en Blender).

Uso:
  blender escena_cc.blend --python tools/blender/bake_vf_body_morphs.py
  blender escena_cc.blend --python tools/blender/export_cc_avatar_glb.py
"""
from __future__ import annotations

import bpy

BODY_OBJECT = "CC_Base_Body"
VF_MORPHS = (
    "vf_belly",
    "vf_chest",
    "vf_waist",
    "vf_hip",
    "vf_arm",
    "vf_leg",
    "vf_neck",
)

# Alias frecuentes en CC / Customuse (ajusta según tu .blend)
CC_ALIASES: dict[str, tuple[str, ...]] = {
    "vf_belly": ("belly", "stomach", "abdomen", "body_belly", "cuz.sld.belly"),
    "vf_chest": ("chest", "pector", "body_chest", "cuz.sld.chest"),
    "vf_waist": ("waist", "body_waist", "cuz.sld.waist"),
    "vf_hip": ("hip", "butt", "glute", "pelvis", "cuz.sld.hip"),
    "vf_arm": ("arm", "upperarm", "bicep"),
    "vf_leg": ("leg", "thigh", "calf"),
    "vf_neck": ("neck",),
}


def get_body() -> bpy.types.Object:
    obj = bpy.data.objects.get(BODY_OBJECT)
    if not obj or obj.type != "MESH":
        raise RuntimeError(f"No mesh {BODY_OBJECT}")
    return obj


def find_source_key(obj: bpy.types.Object, aliases: tuple[str, ...]) -> str | None:
    keys = obj.data.shape_keys.key_blocks
    for key in keys:
        name = key.name.lower()
        if any(alias in name for alias in aliases):
            return key.name
    return None


def copy_or_empty_key(obj: bpy.types.Object, target: str, source: str | None) -> None:
    if obj.data.shape_keys is None:
        obj.shape_key_add(name="Basis", from_mix=False)

    keys = obj.data.shape_keys.key_blocks
    if target in keys:
        return

    if source and source in keys:
        obj.shape_key_add(name=target, from_mix=False)
        tgt = keys[target]
        src = keys[source]
        tgt.value = 1.0
        for i in range(len(tgt.data)):
            tgt.data[i].co = src.data[i].co
        tgt.value = 0.0
        print(f"  {target} <- {source}")
        return

    obj.shape_key_add(name=target, from_mix=False)
    print(f"  {target} (vacío — edita en Blender o vincula alias)")


def main() -> None:
    body = get_body()
    bpy.context.view_layer.objects.active = body
    body.select_set(True)

    print("Bake vf_* morphs en", BODY_OBJECT)
    for vf_name in VF_MORPHS:
        source = find_source_key(body, CC_ALIASES[vf_name])
        copy_or_empty_key(body, vf_name, source)

    print("Listo. Exporta con export_cc_avatar_glb.py (export_morph=True).")


if __name__ == "__main__":
    main()
