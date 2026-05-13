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
