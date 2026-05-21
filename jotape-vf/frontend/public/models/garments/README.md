# Prendas 3D (GLB)

La app **solo** renderiza ropa desde archivos `.glb` reales. No hay shells, shaders de máscara ni geometría procedural en runtime.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `tshirt.glb` | Camiseta (torso + mangas + cuello), blanco `#F2F2F2` |
| `shorts.glb` | Shorts (cintura + piernas), blanco `#F0F0F0` |

## Regenerar todo el outfit (Blender)

Desde `jotape-vf/`:

```bash
npm run export:all-garments
```

Por prenda:

```bash
npm run export:tshirt
npm run export:shorts
```

Salida: `frontend/public/models/garments/`

Scripts: `tools/blender/export_tshirt_glb.py`, `tools/blender/export_shorts_glb.py`

## Pipeline en la app

`Blender/GLB` → `useGLTF(GARMENT_TSHIRT_GLB)` → `mergeGarmentIntoBody()` → misma normalización que el avatar → `MeshStandardMaterial` (tela PBR).

## Ready Player Me (futuro)

Con avatares RPM (esqueleto), exportar la prenda con **los mismos huesos** y pesos de skinning para que siga el rig en animación.
