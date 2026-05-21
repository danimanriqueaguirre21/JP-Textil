# JotaPe VF (JotaPe Virtual Fitting)

Monorepo oficial: e-commerce + **predicción de tallas** (Random Forest) para **JotaPe Textil** (Huancayo, Perú).  
El contenido de **`virtual-fitting-ai`** fue **migrado aquí**; desarrolla solo en `jotape-vf/`.

## Migración desde `virtual-fitting-ai`

| Origen | Destino en `jotape-vf` |
|--------|-------------------------|
| `virtual-fitting-ai/frontend/` | `frontend/` (Next.js 16, App Router, tienda completa) |
| `virtual-fitting-ai/backend/` | `backend/` (FastAPI, Clean Architecture + Alembic) |
| `virtual-fitting-ai/docs/*.md` | `docs/01-analisis/`, `02-requerimientos/`, etc. |
| `docker-compose.yml` (raíz vf) | Referencia: `docker-compose.legacy-vf.yml` |

**Añadido en VF:** módulo `backend/src/ml/`, endpoint **`POST /api/v1/predictions/`**, CORS para `localhost:3000`, dependencias `joblib` / `scikit-learn`.  
Referencia: `docs/03-arquitectura/MIGRACION.md`.

## Objetivo

Reducir devoluciones por tallas incorrectas en ventas online.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, JWT |
| Base de datos | PostgreSQL 16 |
| ML | scikit-learn (Random Forest), `joblib` — artefactos en `ai-models/serialized/` |
| Infra | Docker Compose (`infra/docker/`), plantilla Nginx |

## Requisitos

- Docker & Docker Compose **o** Python 3.11+ / 3.13, Node 20+, PostgreSQL 16

## Inicio rápido (Docker)

```bash
make dev
```

Usa `infra/docker/docker-compose.yml`: **db**, **api** (8000), **web** (3000).

- API: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- Predicción: `POST http://localhost:8000/api/v1/predictions/`

## Comandos (Makefile)

| Comando | Descripción |
|---------|-------------|
| `make dev` | `docker compose -f infra/docker/docker-compose.yml up --build` |
| `make test-backend` | `pytest` en `backend/` |
| `make test-frontend` | `npm test` en `frontend/` |
| `make lint-backend` | Ruff en `backend/src` |
| `make lint-frontend` | ESLint en `frontend/` |
| `make clean` | Baja contenedores y volúmenes del compose |

## Backend (local)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
set PYTHONPATH=.
# PowerShell: $env:PYTHONPATH="."
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Variables: ver `.env.example` (`DATABASE_*`, `JWT_*`, `JOTAPE_RF_MODEL`).

## Frontend (local)

```bash
# Desde la raíz (hay package.json que delega a frontend/)
npm install
npm run dev

# O entrando al paquete
cd frontend
npm install
npm run dev
```

## Predicción ML

1. Entrenar y guardar modelo en `ai-models/serialized/` (p. ej. `rf_size.joblib`).
2. Definir `JOTAPE_RF_MODEL` apuntando al `.joblib` (Docker: variable en servicio `api`).

Cuerpo JSON: `{ "height_cm": 170, "weight_kg": 70, "fit": "regular" }` (`fit`: `slim` \| `regular` \| `oversize`).

## Pruebas (integradas por capa)

| Capa | Comando |
|------|---------|
| Backend | `make test-backend` o `cd backend && python -m pytest -v --cov-fail-under=80` |
| Frontend | `make test-frontend` o `cd frontend && npm test` |
| Integración Docker | `make test-integration` |
| E2E Cypress | `cd frontend && npm run cypress:run` (con `npm run start` en :3000) |

Detalle: `docs/03-arquitectura/architecture.md` y `docs/06-testing/plan-pruebas.md`.

## Estructura (resumen)

```
jotape-vf/
├── ai-models/
├── backend/              # FastAPI; test_*.py junto a cada módulo en src/
├── frontend/             # Next.js; *.test.tsx + cypress/e2e + src/cypress/
├── infra/docker/tests/   # integración (stack Docker)
├── docs/
└── .github/workflows/    # CI en cada PR
```

## Licencia

Propietario — JotaPe Textil / uso académico según corresponda.
