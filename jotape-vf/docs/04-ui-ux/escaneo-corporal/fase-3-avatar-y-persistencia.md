# Fase 3 — Avatar 3D, fusión de medidas y persistencia

## Objetivo

Cerrar el ciclo **escaneo → medidas fusionadas → calibración del avatar 3D → recomendador de talla**, con opción de **guardar medidas en PostgreSQL** para usuarios autenticados.

## Alcance entregado

### 1. Perfil corporal (altura / peso)

| Clave | Ubicación |
|-------|-----------|
| `jotape-body-profile-v1` | `localStorage` |
| Formulario | Revisión del escaneo, `/account/measurements`, componente `BodyProfileForm` |

La **altura del perfil** se usa como referencia al analizar fotos con MediaPipe (`analyzeBodyScanCapture(..., profile.heightCm)`).

### 2. Fusión frontal + lateral

**Archivo:** `frontend/src/lib/body-scan/fuse-measurements.ts`

| Medida | Origen |
|--------|--------|
| Altura | Perfil del usuario (prioridad) |
| Hombros / cadera | Vista frontal |
| Cintura | Promedio frontal + lateral |
| Pecho | Estimación desde hombros + lateral |
| Profundidad torso | Vista lateral → `depthCm` |
| Brazo / pierna / torso | Landmarks MediaPipe (`estimate-limb-measurements.ts`) o proporción por altura |

Escalas por zona (`computeAvatarZoneScales`):

| Zona | Medida / referencia (~170 cm M) |
|------|----------------------------------|
| `shoulder` | Ancho hombros / 44 cm |
| `chest` | Pecho / 96 cm |
| `waist` | Cintura / 78 cm |
| `hip` | Cadera / 98 cm |
| `depth` | Profundidad / 24 cm |
| `arm` | Largo brazo / 58 cm |
| `leg` | Largo pierna / 82 cm |

### 3. Calibración del avatar 3D

**Almacenamiento:** `jotape-avatar-calibration-v2` (`localStorage`; migra desde `v1`)

**Tipo:** `AvatarCalibration` + `AvatarZoneScales` en `types/avatar-calibration.ts`

**Aplicación 3D (MVP, sin avatar generado):**

- `mannequinScaleForHeight(heightCm)` — escala uniforme de altura
- `zoneScalesToMorphInfluences` — medidas MediaPipe → `morphTargetInfluences`
- `applyAvatarBodyMorphs` — deforma pecho, cintura, abdomen, cadera, brazos, piernas, cuello (`vf_*`)
- `ensureProceduralBodyMorphs` — crea morphs en runtime si el GLB no los trae
- `applyAvatarLimbLength` — solo alarga/acorta brazos y piernas por hueso (eje Y)
- `refitAvatarGround` — recoloca el modelo tras deformar
- Cadena: `FittingScene` → `AvatarView` → `GltfAvatar` → `buildOutfitRig`

**Export Blender (opcional, mejor calidad):** `tools/blender/bake_vf_body_morphs.py` + `export_cc_avatar_glb.py` (`export_morph=True`). En carga, `pruneCcMorphTargetsKeepingBody` elimina morphs faciales CC y conserva solo `vf_*`.

Los campos `widthScale` / `depthScale` se mantienen por compatibilidad; equivalen a `zoneScales.shoulder` y `zoneScales.depth`.

**UI:** botón **Aplicar a probador 3D** en revisión del escaneo → redirige a `/try-on#avatar` con badge «Avatar calibrado».

### 4. Persistencia backend

Tabla existente: `medidas_usuario`

| Método | Ruta FastAPI | BFF Next |
|--------|--------------|----------|
| GET actual | `GET /users/me/measurements/current` | `GET /api/measurements` |
| POST nueva | `POST /users/me/measurements` | `POST /api/measurements` |

Al crear una medida nueva, las filas anteriores del usuario pasan a `es_actual = false`.

**Payload POST (sin imágenes):**

```json
{
  "altura_cm": 178,
  "peso_kg": 72,
  "pecho_cm": 96,
  "cintura_cm": 82,
  "cadera_cm": 98,
  "hombro_cm": 45,
  "fuente": "body_scan"
}
```

### 5. Recomendador de talla

`SizeRecommender` en `/try-on` rellena altura y peso desde `AvatarCalibration` si existe.

## Flujo completo (fases 1–3)

```mermaid
flowchart TB
  A[Instrucciones] --> B[Captura frontal]
  B --> C[MediaPipe frontal]
  C --> D[Captura lateral]
  D --> E[MediaPipe lateral]
  E --> F[Revisión + perfil altura/peso]
  F --> G[fuseBodyScanMeasurements]
  G --> H[buildAvatarCalibration]
  H --> I[localStorage + opcional POST API]
  I --> J[/try-on avatar 3D]
  I --> K[SizeRecommender]
```

## Archivos principales

```
frontend/src/lib/body-scan/
  fuse-measurements.ts
  avatar-calibration-storage.ts
  body-profile-storage.ts

frontend/src/hooks/
  use-avatar-calibration.ts
  use-body-profile.ts

frontend/src/components/body-scan/
  body-scan-apply-panel.tsx

frontend/src/services/measurements.service.ts
frontend/src/app/api/measurements/route.ts

backend/src/modules/users/
  infrastructure/measurements_repo.py
  presentation/measurement_schemas.py
  presentation/routes.py  (+ endpoints medidas)
```

## Cómo probar

1. Definir altura en el formulario de revisión (p. ej. 175 cm).
2. Completar escaneo con poses válidas.
3. Pulsar **Aplicar a probador 3D**.
4. En `/try-on`, comprobar badge de calibración y proporciones del avatar.
5. Con sesión iniciada y backend en `:8000`, verificar fila en `medidas_usuario`.

```bash
# Backend
cd jotape-vf/backend
python -m pytest src/modules/users/presentation/test_measurements.py -q

# Frontend
cd jotape-vf/frontend
npm run test -- --testPathPattern=fuse-measurements
```

## Privacidad

- Las **fotos** siguen solo en `sessionStorage` del navegador.
- El **POST** al API envía únicamente medidas numéricas, no imágenes.

## Pendiente / mejoras

- Cargar medidas del servidor al iniciar sesión y fusionar con `localStorage`.
- Recomendación ML usando medidas fusionadas en `POST /api/predictions`.
- Peso automático o IMC estimado (opcional).
- E2E Cypress del flujo completo de escaneo.
