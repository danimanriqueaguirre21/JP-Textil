# Plan de Pruebas - JotaPe VF

## Principio: tests integrados por capa

No usar una carpeta `tests/` suelta en la raíz del monorepo. Cada tipo de prueba vive **donde corresponde** en la arquitectura.

| Tipo | Herramienta | Ubicación |
|------|-------------|-----------|
| Unitarias backend | PyTest | `backend/src/**/test_*.py` |
| Unitarias frontend | Jest + RTL | `frontend/src/**/*.test.ts(x)` |
| Rutas compartidas E2E | TypeScript | `frontend/src/cypress/paths.ts` |
| E2E | Cypress | `frontend/cypress/e2e/` |
| Integración (Docker) | bash + curl | `infra/docker/tests/` |

## Estándares

- ISO/IEC 25010 — calidad del producto
- ISO/IEC 29119 — procesos de prueba
- ISO/IEC 27001 — seguridad (auth, datos)

## Herramientas

| Tipo | Herramienta |
|------|-------------|
| Unitarias backend | PyTest + pytest-cov |
| Unitarias frontend | Jest + React Testing Library |
| E2E | Cypress 14 |
| Integración | Docker Compose + `run-stack-health.sh` |
| API manual | Postman / Hoppscotch |
| Rendimiento (futuro) | JMeter |
| Seguridad (futuro) | OWASP ZAP |

## Tipos de prueba

1. **Unitarias** — funciones, schemas, ML stub, seguridad JWT, carrito (`store/cart-context`), catálogo, probador virtual (`lib/virtual-fitting/*`)
2. **Integración** — API + PostgreSQL en Docker (`infra/docker/tests/`)
3. **E2E** — flujos de tienda y probador 3D (Cypress en CI)
4. **Funcionales** — catálogo, carrito, checkout, try-on (ver tabla E2E abajo)
5. **Rendimiento** — API &lt; 500 ms (objetivo)
6. **Seguridad** — XSS, CSRF, auth (roadmap)
7. **ML** — precisión modelo &gt; 90 % cuando exista `.joblib` en producción

## Cypress E2E (implementado)

Rutas centralizadas en `frontend/src/cypress/paths.ts` (home, catálogo, producto, carrito, checkout, try-on).

| Spec | Flujo | `data-testid` relevantes |
|------|-------|--------------------------|
| `home.cy.ts` | Carga del hero de marketing | `home-hero` |
| `cart.cy.ts` | Añadir prenda, ver bolsa, quitar línea | `product-name`, `size-*`, `add-to-cart`, `cart-page`, `cart-line-name`, `cart-subtotal`, `cart-remove`, `cart-empty` |
| `checkout.cy.ts` | Bolsa → checkout → confirmación | `go-checkout`, `checkout-total`, `checkout-name`, `checkout-email`, `checkout-submit`, `checkout-success` |
| `try-on.cy.ts` | Probador 3D: texto, género, talla, canvas | `aria-label="Tipo de avatar"`, botones de talla |

**Persistencia del carrito en E2E:** clave `jotape-textil-cart-v1` en `localStorage`. Los specs llaman `cy.clearLocalStorage()` en `beforeEach` cuando aplica.

**Requisito para E2E local:** ejecutar contra build de producción (`npm run build` + `npm run start`). Con `npm run dev` los tests pueden fallar si el bundle en caliente no coincide con el código probado.

## Jest — alcance de cobertura (frontend)

Configuración en `frontend/jest.config.mjs`. Umbral global **≥ 80 %** (statements, branches, functions, lines).

**Incluido en `collectCoverageFrom`:**

- `src/lib/**` (formato, datos, carrito puro, virtual-fitting excepto módulos 3D pesados)
- `src/store/**` (`cart-context`)
- `src/hooks/**` (excepto cámara y MediaPipe)
- `src/services/**` (excepto clientes HTTP y APIs externas)
- `src/cypress/paths.ts`

**Excluido (complejidad 3D / I/O externo):**

- `garment-glb.ts`, `garment-renderer.ts`, `avatar-mesh-utils.ts`
- `recommender.ts`, `use-camera.ts`, `use-mediapipe-pose.ts`
- `api-client.ts`, `auth.service.ts`, `virtual-fitting.service.ts`
- Componentes React (se prueban con RTL solo donde hay `*.test.tsx` dedicado, p. ej. `product-card`)

**Tests representativos (~55):** `cart-context`, `cart` (lib), `catalog.service`, `products`, `format`, `paths`, virtual-fitting (tallas, colores, medidas, cámara 3D utilidades), UI (`card`, `product-card`).

## Métricas de aceptación

- **Cobertura ≥ 80 %** en backend (`src/`) y en el conjunto medido en frontend (`jest.config.mjs`)
- Defectos críticos: 0
- Defectos mayores: &lt; 5
- CI en verde en cada PR (`ci.yml`): lint, Jest, build, Cypress (5 tests), Docker health

## Ejecución local

```bash
# Backend (sin BD: excluye tests @postgres)
cd backend && python -m pytest -m "not postgres" -v

# Backend completo (requiere PostgreSQL en jotape_test)
cd backend && python -m pytest -v --cov-fail-under=80

# Frontend — unitarias + cobertura
cd frontend && npm test

# E2E — build de producción + Cypress
cd frontend && npm run build && npm run start
# otra terminal:
cd frontend && npm run cypress:run

# Cypress interactivo (misma base URL :3000)
cd frontend && npm run cypress:open

# Integración Docker
bash infra/docker/tests/run-stack-health.sh
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) en cada PR:

1. **Backend** — Ruff + PyTest con cobertura ≥ 80 %
2. **Frontend** — ESLint + Jest + `next build` + Cypress (`start: npm run start`, `wait-on: http://127.0.0.1:3000`)
3. **Integración** — `infra/docker/tests/run-stack-health.sh`

## Roadmap de pruebas (pendiente)

- E2E: búsqueda, categorías, cuenta de usuario, probador con cámara (MediaPipe)
- Jest: componentes `CartView`, `CheckoutForm`, escena 3D con mocks de Three.js
- Rendimiento (JMeter) y seguridad (OWASP ZAP)
- ML: validación del modelo serializado en CI cuando exista artefacto en `ai-models/serialized/`
