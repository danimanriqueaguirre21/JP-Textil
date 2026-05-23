"""Crea la base de datos jotape si no existe (usa credenciales de .env)."""
import os
import sys

try:
    import psycopg
except ImportError:
    print("Instala dependencias: pip install psycopg[binary]")
    sys.exit(1)

from pathlib import Path

# Cargar .env simple
env_path = Path(__file__).resolve().parents[1] / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

host = os.environ.get("DATABASE_HOST", "localhost")
port = int(os.environ.get("DATABASE_PORT", "5432"))
user = os.environ.get("DATABASE_USER", "postgres")
password = os.environ.get("DATABASE_PASSWORD", "postgres")
dbname = os.environ.get("DATABASE_NAME", "jotape")

conn = psycopg.connect(
    host=host, port=port, user=user, password=password, dbname="postgres"
)
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
if cur.fetchone():
    print(f"La base '{dbname}' ya existe.")
else:
    cur.execute(f'CREATE DATABASE "{dbname}"')
    print(f"Base '{dbname}' creada correctamente.")
conn.close()
