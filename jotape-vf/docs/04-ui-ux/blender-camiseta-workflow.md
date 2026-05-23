# Camiseta en Blender (antes del probador web)

Flujo acordado: **terminar la prenda en Blender** y solo después exportar a `frontend/public/models/clothing/`.

## Objeto de trabajo en Blender

| Objeto | Uso |
|--------|-----|
| `male_basemesh` | Referencia del cuerpo |
| `eyes` | Ojos (no tocar) |
| **`Tshirt_WIP`** | Camiseta en edición (sin integrar aún) |

## Qué NO hacer en esta fase

- No copiar aún a `tshirt.glb` del proyecto.
- No cambiar `clothing-paths.ts` ni `/try-on` hasta export final.
- Evitar **Shrinkwrap + Solidify** sobre malla extraída (causa fragmentos y z-fighting).

## Edición recomendada en Blender

1. **Sculpt** o **Edit Mode**: suavizar cuello, mangas y bajo.
2. **Solidify** solo al final (0.003–0.006 m), luego **Apply**.
3. Si hace falta holgura: escalar ligeramente en X/Z o mover vértices, no Shrinkwrap 0.018.
4. **Weighted Normal** + Smooth shading.
5. Material: blanco, Roughness ~0.85.

## Cuando esté aprobada

1. File → Export → glTF 2.0 → `tshirt.glb` (o `tshirt-preview.glb` de prueba).
2. Opciones: **+Y Up**, Apply Transform, solo `Tshirt_WIP` seleccionado.
3. En el proyecto:
   ```bash
   # Reemplazar producción cuando apruebes
   copy frontend\public\models\clothing\tshirt-export.glb frontend\public\models\clothing\tshirt.glb
   ```
4. Recarga fuerte en `/try-on`: **Ctrl+Shift+R**.

## Regenerar base desde el avatar (opcional)

Si quieres volver a empezar desde el cuerpo (mismo espacio que `male.glb`):

```bash
cd jotape-vf
npm run export:tshirt:preview
```

Importa `tshirt-preview.glb` en Blender como nueva referencia (no sustituye tu trabajo manual en `Tshirt_WIP`).
