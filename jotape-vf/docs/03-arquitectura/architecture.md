# Arquitectura del Sistema

## Arquitectura general

El sistema se divide en tres módulos principales:

- **frontend** — Next.js (App Router), tienda y probador virtual
- **backend** — FastAPI, Clean Architecture, API REST
- **ai-models** — entrenamiento e inferencia ML (Random Forest, visión)

---

## Frontend

**Tecnologías:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui

**Responsabilidades:** interfaz, catálogo, carrito, autenticación, consumo de APIs

---

## Backend

**Tecnologías:** FastAPI, PostgreSQL, SQLAlchemy, Alembic

**Responsabilidades:** negocio, auth JWT, usuarios, predicciones de talla, integración ML

---

## AI Models

**Tecnologías:** scikit-learn / joblib, PyTorch, OpenCV, MediaPipe (roadmap)

**Responsabilidades:** predicción de tallas, visión computacional, probador virtual

---

## Arquitectura de desarrollo

- **Patrón:** Clean Architecture (presentation → application → domain → infrastructure)
- **Modular, escalable, desacoplado**

---

## Infraestructura

- **Contenedores:** Docker Compose (`infra/docker/`)
- **Base de datos:** PostgreSQL
- **Control de versiones:** Git + GitHub

---

## Estrategia de pruebas (integrada por capa)

Las pruebas **no** viven en una carpeta `tests/` global del monorepo. Cada capa lleva sus tests **junto al código** que validan.

| Capa | Herramienta | Ubicación | Cobertura mínima |
|------|-------------|-----------|------------------|
| Backend (unitarias / API) | PyTest | `backend/src/**/test_*.py` al lado del módulo | 80 % (`pytest --cov-fail-under=80`) |
| Frontend (unitarias / componentes) | Jest + React Testing Library | `frontend/src/**/*.test.ts(x)` junto al componente o util | 80 % (archivos bajo cobertura en `jest.config.mjs`) |
| Cypress (helpers compartidos) | Cypress | `frontend/src/cypress/` | — |
| E2E | Cypress | `frontend/cypress/e2e/` (layout oficial) | flujos críticos en CI |
| Integración (stack Docker) | bash + curl | `infra/docker/tests/` | health API en cada PR |

### Backend

```
backend/
├── conftest.py              # fixtures compartidos
├── pytest.ini
├── .coveragerc
└── src/
    ├── core/test_*.py
    ├── ml/test_*.py
    ├── modules/<modulo>/.../test_*.py
    └── shared/.../test_*.py
```

Tests con `@pytest.mark.postgres` requieren PostgreSQL (CI y local con servicio activo).

### Frontend

```
frontend/
├── jest.config.mjs
├── jest.setup.js
├── cypress.config.ts
├── cypress/
│   ├── e2e/*.cy.ts          # E2E
│   └── support/
└── src/
    ├── cypress/             # paths, fixtures, helpers
    ├── lib/*.test.ts
    └── components/**/**.test.tsx
```

### Integración

- Script: `infra/docker/tests/run-stack-health.sh`
- Levanta `db` + `api`, valida `GET /health`, apaga contenedores

### CI (GitHub Actions)

En cada **pull request** a `main` (`.github/workflows/ci.yml`):

1. **backend** — `ruff` + `pytest` con PostgreSQL y cobertura ≥ 80 %
2. **frontend** — `lint`, `npm test`, `build`, Cypress E2E
3. **integration** — stack Docker + health check

Comandos locales (desde la raíz):

```bash
make test-backend
make test-frontend
make test-integration
```
