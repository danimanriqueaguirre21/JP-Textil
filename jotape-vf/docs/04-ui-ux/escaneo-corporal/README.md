# Escaneo corporal — Probador virtual JotaPe

Sistema de captura y análisis de fotos de cuerpo completo para estimar medidas y, en fases posteriores, calibrar el avatar 3D.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [Fase 1 — Captura guiada](./fase-1-captura-guiada.md) | Cámara, subida, instrucciones, almacenamiento temporal |
| [Fase 2 — MediaPipe Pose](./fase-2-mediapipe-pose.md) | Landmarks, validación, medidas estimadas |
| [Fase 3 — Avatar y persistencia](./fase-3-avatar-y-persistencia.md) | Fusión, calibración 3D, API medidas |
| [Fase 3 — Notas históricas](./fase-3-roadmap.md) | Borrador inicial del roadmap |

## Rutas en la app

| URL | Acceso | Descripción |
|-----|--------|-------------|
| `/account/measurements/scan` | Usuario autenticado | Flujo principal en cuenta |
| `/try-on/body-scan` | Público (Try-On Lab) | Mismo flujo con layout de probador |
| `/account/measurements` | Cuenta | Hub con enlace al escáner |

## Arquitectura frontend (resumen)

```
app/.../measurements/scan/page.tsx
  └── BodyScanFlow
        ├── BodyScanCapturePanel   (fase 1)
        ├── BodyScanInstructions
        ├── BodyScanReview         (fase 1 + 2)
        │     ├── BodyScanPoseThumb      (overlay landmarks)
        │     └── BodyScanMeasurementsSummary
        └── analyzeBodyScanCapture()  → mediapipe-pose-bridge.ts

lib/body-scan/
  scan-session-storage.ts    sessionStorage
  capture-frame.ts           JPEG desde cámara/archivo
  mediapipe-pose-bridge.ts   MediaPipe Pose estático
  body-scan-pose-validation.ts
```

## Requisitos funcionales relacionados

- **RF-07** — Captura guiada de medidas (cámara / imagen)
- **RF-08** — Extracción de medidas corporales (MediaPipe)
- **RF-09** — Recomendación de talla / avatar (fase 3+)

## Estado actual

| Fase | Estado |
|------|--------|
| 1 — Captura guiada | ✅ Implementada |
| 2 — MediaPipe Pose | ✅ Implementada |
| 3 — Avatar 3D + persistencia | ✅ Implementada |
