"""Datos base requeridos por la aplicación."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.shared.db.modelos import Rol

ROLES_INICIALES = (
    ("admin", "Administrador", "Acceso total al panel"),
    ("cliente", "Cliente", "Compras y probador virtual"),
    ("operador", "Operador", "Gestión de pedidos y personalización"),
)


def asegurar_roles(session: Session) -> None:
    for codigo, nombre, descripcion in ROLES_INICIALES:
        existe = session.execute(select(Rol).where(Rol.codigo == codigo)).scalar_one_or_none()
        if existe:
            continue
        session.add(Rol(codigo=codigo, nombre=nombre, descripcion=descripcion, activo=True))
    session.commit()


def obtener_rol_por_codigo(session: Session, codigo: str) -> Rol:
    rol = session.execute(select(Rol).where(Rol.codigo == codigo)).scalar_one_or_none()
    if not rol:
        asegurar_roles(session)
        rol = session.execute(select(Rol).where(Rol.codigo == codigo)).scalar_one()
    return rol
