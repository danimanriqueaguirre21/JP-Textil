# Ropa GLB real (`tshirt.glb`, `shorts.glb`)

La app renderiza **solo** archivos GLB — sin `BoxGeometry`, `CapsuleGeometry`, shells ni placeholders en React.

## Estructura

```
public/models/
  avatars/
    male.glb
    female.glb
  clothing/
    tshirt.glb          ← hombre (exportado desde male.glb)
    shorts.glb
    tshirt-female.glb   ← mujer (exportado desde female.glb)
    shorts-female.glb
```

## Encaje automático (runtime)

1. Carga con `useGLTF` (avatar + camiseta + short).
2. Clona cada mesh (no muta el caché de drei).
3. Si la prenda tiene muchos vértices (exportada del mismo avatar) → modo **sameSpace** + offsets en `clothing-offsets.ts`.
4. Si es un GLB pequeño (caja de Blender) → escala por región del torso/cadera (`alignGarmentToBodyMesh`).
5. Normaliza altura del rig (~1.72–1.78 m, pies en Y=0).

## Ajuste fino en código

`frontend/src/lib/clothing/clothing-offsets.ts`:

```ts
male: {
  tshirt: { position: [0, -0.06, 0.008], scale: [1, 1, 1], rotation: [0, 0, 0] },
  shorts: { position: [0, -0.02, 0.006], scale: [1, 1, 1], rotation: [0, 0, 0] },
}
```

Sube/baja `position[1]` si el polo queda alto o el short bajo.

## Alinear en Blender (recomendado)

1. Abre `male.glb` como referencia (misma T-pose).
2. Modela solo la prenda encima del torso o cadera.
3. Mismo origen y escala que el avatar (pies en Y=0 o centro de cadera).
4. Exporta **solo** la malla de la prenda → `tshirt.glb` / `shorts.glb`.
5. Regenerar desde el avatar del repo:

```bash
cd jotape-vf
npm run export:clothing:mesh
```

Genera los 4 archivos (hombre + mujer).

6. Recarga el navegador con **Ctrl+Shift+R**.

## Materiales

- Materiales del GLB o `MeshStandardMaterial` de respaldo si el GLB no trae texturas.
