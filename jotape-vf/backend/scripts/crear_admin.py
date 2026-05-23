"""Crea o actualiza el usuario administrador inicial."""
from __future__ import annotations

import os
import sys
from pathlib import Path

# backend/ en PYTHONPATH
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import bcrypt
from sqlalchemy import select


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

from src.shared.db.modelos import Usuario
from src.shared.db.semillas import asegurar_roles, obtener_rol_por_codigo
from src.shared.db.session import SessionLocal

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@jotape.textil").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
ADMIN_NOMBRE = os.environ.get("ADMIN_NOMBRE", "Administrador")


def main() -> None:
    if not ADMIN_PASSWORD:
        print("Define ADMIN_PASSWORD en el entorno (mín. 12 caracteres).")
        sys.exit(1)
    if len(ADMIN_PASSWORD) < 12:
        print("ADMIN_PASSWORD demasiado corta (mín. 12).")
        sys.exit(1)

    db = SessionLocal()
    try:
        asegurar_roles(db)
        rol_admin = obtener_rol_por_codigo(db, "admin")
        existente = db.execute(
            select(Usuario).where(Usuario.email == ADMIN_EMAIL)
        ).scalar_one_or_none()

        if existente:
            existente.rol_id = rol_admin.id
            existente.activo = True
            existente.contrasena_hash = hash_password(ADMIN_PASSWORD)
            existente.nombre_completo = ADMIN_NOMBRE
            db.commit()
            print(f"Usuario '{ADMIN_EMAIL}' actualizado como administrador.")
        else:
            db.add(
                Usuario(
                    email=ADMIN_EMAIL,
                    contrasena_hash=hash_password(ADMIN_PASSWORD),
                    nombre_completo=ADMIN_NOMBRE,
                    rol_id=rol_admin.id,
                    activo=True,
                    email_verificado=True,
                )
            )
            db.commit()
            print(f"Administrador creado: {ADMIN_EMAIL}")

        print(f"\nAdmin listo: {ADMIN_EMAIL}")
        print("Inicia sesión en /login (la contraseña no se muestra por seguridad).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
