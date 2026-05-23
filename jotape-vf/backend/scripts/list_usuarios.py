import os
import sys
from pathlib import Path

import psycopg

env_path = Path(__file__).resolve().parents[1] / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

conn = psycopg.connect(
    host=os.environ.get("DATABASE_HOST", "localhost"),
    port=int(os.environ.get("DATABASE_PORT", "5432")),
    user=os.environ.get("DATABASE_USER", "postgres"),
    password=os.environ.get("DATABASE_PASSWORD", "postgres"),
    dbname=os.environ.get("DATABASE_NAME", "jotape"),
)
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM usuarios")
print("Total usuarios:", cur.fetchone()[0])
cur.execute(
    "SELECT id, email, nombre_completo, activo, creado_en "
    "FROM usuarios ORDER BY creado_en DESC LIMIT 10"
)
rows = cur.fetchall()
if rows:
    print("\n--- Ultimos usuarios ---")
    for r in rows:
        print(r)
else:
    print("\nNo hay usuarios registrados aun.")
cur.execute("SELECT id, codigo, nombre FROM roles ORDER BY codigo")
print("\n--- Roles ---")
for r in cur.fetchall():
    print(r)
conn.close()
