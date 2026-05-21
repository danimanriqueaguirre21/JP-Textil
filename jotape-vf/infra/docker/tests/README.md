# Pruebas de integración (Docker)

El script `run-stack-health.sh` levanta `infra/docker/docker-compose.yml`, espera a que la API responda en `GET /health` y apaga los contenedores al terminar.

Uso (desde la raíz del repo `jotape-vf/`):

```bash
bash infra/docker/tests/run-stack-health.sh
```

Requisitos: Docker Engine y plugin Compose v2.

En CI se ejecuta en cada pull request (workflow `.github/workflows/ci.yml`).
