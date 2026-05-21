# JotaPe Textil Backend (FastAPI)

## Run (local)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## Run (docker)

```bash
docker compose up --build
```

## Pruebas (PyTest integrado)

Los tests viven **junto al código** en `src/**/test_*.py` (no en `tests/` aparte).

```bash
cd backend
python -m pytest -v --cov-fail-under=80
```

Sin PostgreSQL (omite `@pytest.mark.postgres`):

```bash
python -m pytest -m "not postgres" -v
```

Configuración: `pytest.ini`, `conftest.py`, `.coveragerc`.
