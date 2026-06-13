# Fase 3 — Roadmap (borrador original)

> **Implementación:** ver [fase-3-avatar-y-persistencia.md](./fase-3-avatar-y-persistencia.md).

## Objetivo

Cerrar el ciclo escaneo → medidas → probador 3D:

1. **Altura real** del usuario (perfil / formulario) para escalar medidas con precisión.
2. **Fusión frontal + lateral** (profundidad de pecho/cadera con vista lateral).
3. **Calibración del avatar 3D** (`gltf-avatar`, `avatar-normalize`, offsets de ropa).
4. **Persistencia** en backend (tabla de medidas / sesión de escaneo).
5. **Recomendación de talla** enlazada a RF-09 (ML + reglas).

## Tareas sugeridas

| # | Tarea | Capa |
|---|--------|------|
| 1 | Campo `altura_cm` en perfil de usuario | Backend + frontend |
| 2 | Pasar altura a `analyzeBodyScanCapture(..., referenceHeightCm)` | `mediapipe-pose-bridge` |
| 3 | Servicio `POST /api/body-scans` (metadatos + medidas, no imágenes en claro) | Backend |
| 4 | Hook `useAvatarCalibration(measurements)` | `lib/virtual-fitting/` |
| 5 | Botón “Aplicar a mi avatar” en revisión del escaneo | `BodyScanReview` |
| 6 | Sincronizar con `SizeRecommender` y PDP | Frontend |

## Criterios de aceptación (borrador)

- Usuario con escaneo válido ve medidas coherentes (±5 cm vs referencia manual en QA).
- Avatar 3D refleja proporciones de hombros/cadera sin penetración extrema de prenda.
- Medidas persistidas asociadas al `usuario_id` autenticado.

## Referencias de código existente

- Probador 2D en vivo: `components/virtual-fitting/virtual-fitting-room.tsx`
- Cálculo de medidas: `lib/virtual-fitting/measurement-calculator.ts`
- Avatar 3D: `components/virtual-fitting/3d/gltf-avatar.tsx`
- Alineación de ropa: `lib/clothing/align-clothing-to-body.ts`
