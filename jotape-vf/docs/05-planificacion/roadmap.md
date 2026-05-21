# Roadmap del Proyecto

Leyenda: ✅ hecho · 🔄 en progreso · ⬜ pendiente

Detalle de pruebas: [`docs/06-testing/plan-pruebas.md`](../06-testing/plan-pruebas.md)

---

## Fase 1 — Frontend E-commerce

**Objetivo:** construcción del frontend moderno del e-commerce.

| Entregable | Estado |
|------------|--------|
| Landing / home (marketing) | ✅ |
| Catálogo y ficha de producto | ✅ |
| Navbar y footer | ✅ |
| Carrito y checkout (demo, sin cobro real) | ✅ |
| Login / register (UI) | ✅ |
| Dashboard usuario (cuenta, pedidos, medidas) | 🔄 UI base |
| E2E Cypress: home, carrito, checkout | ✅ |
| Jest: lib, store, servicios (≥ 80 % en alcance configurado) | ✅ |

**Pendiente:** búsqueda avanzada, pedidos reales conectados al backend, E2E de cuenta y categorías.

---

## Fase 2 — Backend y Base de Datos

**Objetivo:** APIs y persistencia de datos.

| Entregable | Estado |
|------------|--------|
| FastAPI + módulos (auth, users, health, predictions) | ✅ |
| PostgreSQL + SQLAlchemy + Alembic | ✅ |
| Docker (backend / stack) | ✅ |
| PyTest + cobertura ≥ 80 % en CI | ✅ |
| Productos / pedidos / pagos en producción | ⬜ |

---

## Fase 3 — Integración Completa

**Objetivo:** conectar frontend y backend.

| Entregable | Estado |
|------------|--------|
| Consumo de APIs (clientes en frontend) | 🔄 |
| Autenticación JWT end-to-end | 🔄 |
| Carrito persistente (`localStorage`, clave `jotape-textil-cart-v1`) | ✅ |
| Pedidos reales y sincronización con BD | ⬜ |

---

## Fase 4 — Machine Learning

**Objetivo:** predicción inteligente de tallas.

| Entregable | Estado |
|------------|--------|
| Recomendador de tallas (reglas / stub en frontend) | ✅ |
| API de predicciones (backend) | ✅ |
| Entrenamiento y modelo `.joblib` en producción | ⬜ |
| Tests ML en CI con artefacto serializado | ⬜ |

**Tecnologías:** PyTorch, Scikit-learn, Pandas.

---

## Fase 5 — Visión Computacional

**Objetivo:** detección corporal.

| Entregable | Estado |
|------------|--------|
| Landmarks y medidas (lógica + tests unitarios) | ✅ |
| Probador 2D con cámara (MediaPipe en cliente) | ✅ |
| E2E del flujo con cámara | ⬜ |

**Tecnologías:** MediaPipe, OpenCV.

---

## Fase 6 — Probador Virtual

**Objetivo:** visualización virtual de prendas.

| Entregable | Estado |
|------------|--------|
| Avatar 3D (GLB hombre / mujer) + prenda adaptada | ✅ |
| Panel `/try-on` (3D + recomendador + sala 2D) | ✅ |
| E2E Cypress en `/try-on` (género, talla, canvas) | ✅ |
| Segmentación / overlay foto real de alta fidelidad | ⬜ |

---

## Fase 7 — Producción

**Objetivo:** despliegue profesional del sistema.

| Entregable | Estado |
|------------|--------|
| Docker Compose (dev / prod) | ✅ |
| CI/CD GitHub Actions (backend, frontend, Cypress, Docker health) | ✅ |
| CD / despliegue a entorno productivo | 🔄 |
| Monitoreo, seguridad (OWASP ZAP), rendimiento (JMeter) | ⬜ |

---

## Calidad y pruebas (transversal)

| Área | Estado | Notas |
|------|--------|--------|
| Cypress E2E | ✅ | `home`, `cart`, `checkout`, `try-on` — ver `plan-pruebas.md` |
| Jest + RTL | ✅ | Cobertura ampliada a `lib/`, `store/`, `hooks/`, `services/` |
| Integración Docker | ✅ | `infra/docker/tests/run-stack-health.sh` |
| E2E búsqueda / cuenta / MediaPipe en vivo | ⬜ | Roadmap en `plan-pruebas.md` |
| JMeter / OWASP ZAP | ⬜ | No funcionales futuros |

**Ejecución E2E local:** `npm run build && npm run start` y en otra terminal `npm run cypress:run`.
