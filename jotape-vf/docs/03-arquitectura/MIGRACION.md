# Migración `virtual-fitting-ai` → `jotape-vf`

## Resumen

- **Frontend**: copia íntegra del App Router (`(store)`, `(auth)`, `(account)`, catálogo, carrito, `/try-on`, etc.).
- **Backend**: copia del proyecto FastAPI por módulos (`auth`, `users`, `health`) + integración VF:
  - `src/ml/predictor.py` — inferencia RF o heurística.
  - `src/modules/predictions/` — rutas y schemas Pydantic.
  - `src/main.py` — `CORSMiddleware` + `app.include_router(predictions_router)`.
- **Documentación**: `company.md`, `requirements.md`, `architecture.md`, `modules.md`, `roadmap.md` bajo `docs/`.
- **Compose**: `infra/docker/docker-compose.yml` alineado con variables `DATABASE_*` del backend migrado.

## Convenciones

- API: `POST /api/v1/predictions/` (REST JSON).
- El repo histórico `virtual-fitting-ai` puede mantenerse solo como archivo; el código activo es **`jotape-vf`**.
