# Pipeline 3D — Avatares y probador (Blender → GLB → R3F)

Objetivo: cuerpo más suave, iluminación tipo estudio (Zara/Nike), rendimiento web estable.

## 0. Qué hace la app hoy (código)

- **`refine-avatar-mesh.ts`**: subdivisión real de triángulos al cargar el GLB (×4 o ×16 según polycount).
- **`garment-glb.ts`**: prenda **GLB real** (`tshirt.glb`) parentada al body mesh antes de normalizar.
- **`flatShading: false`** en todos los materiales.
- Cámara más alejada (FOV 28°, margen ~1.5).

Para calidad tipo Zara/Nike, **re-exporta GLB con Subdiv Apply en Blender** (script abajo) y sustituye `male.glb` / `female.glb`.

## 1. Blender — suavizar basemesh (dan283)

Archivos actuales: `frontend/public/models/avatars/male.glb`, `female.glb`.

### Importar

1. File → Import → glTF 2.0 (.glb)
2. Seleccionar el mesh principal (cuerpo)

### Shade Smooth + Auto Smooth

1. Object Mode → clic derecho en mesh → **Shade Smooth**
2. Properties (ícono verde) → **Normals** → activar **Auto Smooth**
3. **Angle** recomendado: `35°`–`45°` (evita pliegues raros en axilas)

### Subdivision Surface (controlado)

1. Modifier Properties → **Subdivision Surface**
2. Levels **Viewport: 1**, **Render: 2** (no más de 2 para web)
3. Opcional: **Apply** solo si el polycount queda &lt; ~80k triángulos por avatar

Regla web: apunta a **30k–70k** triángulos por personaje completo.

### Prenda embebida en el GLB

Ocultar o eliminar meshes de ropa embebidos en el basemesh (la app usa `public/models/garments/tshirt.glb`).

### Exportar GLB

File → Export → glTF 2.0 (.glb):

| Opción | Valor |
|--------|--------|
| Format | GLB |
| Include | Selected Objects (solo cuerpo + pelo si aplica) |
| Transform | +Y Up |
| Geometry | Apply Modifiers ✓ |
| Normals | ✓ |
| UVs | ✓ |
| Tangents | ✓ (si usas normal maps en Blender) |
| Compression | Draco opcional (menor peso; Three.js lo soporta con `useGLTF` + draco loader) |

Tras exportar, reemplazar `male.glb` / `female.glb` y probar en `/try-on`.

**Script automatizado** (desde repo):

```bash
# Abrir male_basemesh_v002.blend en Blender, luego:
blender path/to/male_basemesh_v002.blend --background --python tools/blender/export_avatars_subdiv.py
```

Genera GLB en `frontend/public/models/avatars/` con modificador Subdivision **aplicado**.

---

## 2. Materiales PBR en la app

La app aplica materiales en código (`avatar-materials.ts`), no depende de materiales embebidos en el GLB:

- **Piel:** `MeshPhysicalMaterial` + normal map procedural
- **Pelo:** physical con roughness alto
- **Prenda:** physical con **sheen** (aspecto tela)

Opcional: exportar desde Blender con Principled BSDF y leer con `mesh.material` si prefieres; el pipeline actual unifica look en TS.

### Normal map de archivo (mejor que procedural)

1. Descargar tile CC0 en [Poly Haven](https://polyhaven.com/textures) (p. ej. skin/leather fine)
2. Guardar en `frontend/public/textures/skin-normal.jpg`
3. En `gltf-avatar.tsx`, usar `useTexture("/textures/skin-normal.jpg")` y pasarlo a `createSkinMaterial(normalMap)`

---

## 3. Escena R3F (implementado en `fitting-scene.tsx`)

- `<Environment preset="studio" />` — HDRI estudio
- `<ContactShadows />` — sombra de contacto en suelo
- Grid atenuado (opacidad / fade)
- `ACESFilmicToneMapping` + exposición ~1.05
- Sombras en meshes del avatar (`castShadow` / `receiveShadow`)

---

## 4. Modelos base alternativos (gratuitos)

| Fuente | Uso | Licencia | Integración |
|--------|-----|----------|-------------|
| [dan283/basemeshes](https://github.com/dan283/basemeshes) | Actual | CC0 | GLB en `public/models/avatars/` |
| [MakeHuman](http://www.makehuman.org/) | Cuerpos paramétricos | CC0 | Export FBX → Blender → GLB |
| [Ready Player Me](https://readyplayer.me/) | Avatares estilizados/realistas | Términos RPM | URL `.glb` en `AVATAR_MODEL_URL` |
| [Mixamo](https://www.mixamo.com/) | Rig + anim (opcional) | Adobe Terms | Solo si necesitas T-pose/A-pose consistente |

### Ready Player Me — integración rápida

1. Crear avatar en RPM → copiar URL del modelo `.glb`
2. En `avatar-models.ts`:

```ts
export const AVATAR_MODEL_URL: Record<AvatarGender, string> = {
  male: "https://models.readyplayer.me/XXXX.glb?morphTargets=...",
  female: "/models/avatars/female.glb", // o segunda URL RPM
};
```

3. `useGLTF` de drei acepta URL absoluta (CORS debe permitir tu dominio en producción)
4. Ajustar `AVATAR_MODEL_CONFIG.targetHeight` y `rotationY` tras primera carga
5. Revisar `findMainBodyMesh` — RPM suele tener un mesh `Wolf3D_Avatar` o similar

### MakeHuman — pipeline

1. MakeHuman → exportar collada/FBX
2. Blender: Shade Smooth, Auto Smooth, Subdiv 1, limpiar ropa
3. Export GLB → `public/models/avatars/`

---

## 5. Rendimiento web

- **Draco:** comprimir GLB en export (Blender glTF Draco)
- **preload:** `useGLTF.preload(url)` (ya en `gltf-avatar.tsx`)
- **dpr:** `[1, 1.5]` en Canvas (ya configurado)
- Evitar Subdiv &gt; 2 en Blender
- No usar subdivision runtime en Three.js

---

## 6. Checklist visual “premium”

- [ ] Auto Smooth 40° en Blender
- [ ] Subdiv viewport 1 aplicado o no aplicado según polycount
- [ ] GLB con normales + UV exportados
- [ ] `Environment preset="studio"` visible en escena
- [ ] ContactShadows bajo los pies
- [ ] Grid discreto (no compite con el avatar)
- [ ] Prenda RPM con skinning al esqueleto del avatar

Referencia de pruebas E2E: `cypress/e2e/try-on.cy.ts`.
