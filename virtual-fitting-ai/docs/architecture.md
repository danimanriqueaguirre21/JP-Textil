# Arquitectura del Sistema

# Arquitectura General

El sistema estará dividido en tres módulos principales:

- frontend
- backend
- ai-models

---

# Frontend

Tecnologías:
- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui

Responsabilidades:
- interfaz de usuario
- catálogo
- carrito
- autenticación
- consumo de APIs

---

# Backend

Tecnologías:
- FastAPI
- PostgreSQL
- SQLAlchemy

Responsabilidades:
- lógica de negocio
- autenticación
- gestión de productos
- pedidos
- usuarios
- comunicación con IA

---

# AI Models

Tecnologías:
- PyTorch
- OpenCV
- MediaPipe

Responsabilidades:
- predicción de tallas
- visión computacional
- probador virtual
- procesamiento de imágenes

---

# Arquitectura de Desarrollo

Patrón:
- Clean Architecture

Características:
- modular
- escalable
- mantenible
- desacoplado

---

# Infraestructura

Contenedores:
- Docker

Base de datos:
- PostgreSQL

Control de versiones:
- Git + GitHub