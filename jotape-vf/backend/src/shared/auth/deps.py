"""Dependencias de autenticación y autorización (RBAC)."""

from collections.abc import Callable

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.modules.auth.infrastructure.security import decode_token
from src.shared.db.modelos import Rol, Usuario
from src.shared.db.session import get_db
from src.shared.errors.exceptions import ForbiddenError, UnauthorizedError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=True)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> Usuario:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token")
    user = db.execute(select(Usuario).where(Usuario.id == user_id)).scalar_one_or_none()
    if not user:
        raise UnauthorizedError("Invalid token")
    if not user.activo:
        raise UnauthorizedError("User disabled")
    return user


def require_rol(*codigos: str) -> Callable[..., Usuario]:
    """Exige que el usuario autenticado tenga uno de los roles indicados."""

    def _dependency(
        db: Session = Depends(get_db),
        current_user: Usuario = Depends(get_current_user),
    ) -> Usuario:
        rol = db.get(Rol, current_user.rol_id)
        if not rol or rol.codigo not in codigos:
            raise ForbiddenError("Insufficient permissions")
        return current_user

    return _dependency
