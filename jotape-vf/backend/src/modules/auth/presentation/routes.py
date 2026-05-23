from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.config import settings
from src.core.rate_limit import limiter
from src.modules.auth.infrastructure.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from src.modules.auth.presentation.schemas import InicioSesionSolicitud, TokenRespuesta
from src.modules.users.presentation.schemas import UsuarioCrear, UsuarioPublico
from src.shared.db.modelos import Usuario
from src.shared.db.semillas import obtener_rol_por_codigo
from src.shared.db.session import get_db
from src.shared.errors.exceptions import ConflictError, UnauthorizedError

router = APIRouter(prefix="/auth", tags=["auth"])

_MSG_CREDENCIALES = "Credenciales inválidas"
_MSG_REGISTRO = "No se pudo completar el registro con ese correo"


@router.post("/register", response_model=UsuarioPublico)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def register(request: Request, payload: UsuarioCrear, db: Session = Depends(get_db)):
    del request
    existing = db.execute(select(Usuario).where(Usuario.email == payload.email)).scalar_one_or_none()
    if existing:
        raise ConflictError(_MSG_REGISTRO)

    rol_cliente = obtener_rol_por_codigo(db, "cliente")
    user = Usuario(
        email=str(payload.email).lower(),
        contrasena_hash=hash_password(payload.contrasena),
        nombre_completo=payload.nombre_completo,
        rol_id=rol_cliente.id,
        activo=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenRespuesta)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def login(request: Request, payload: InicioSesionSolicitud, db: Session = Depends(get_db)):
    del request
    user = db.execute(select(Usuario).where(Usuario.email == payload.email)).scalar_one_or_none()
    if not user or not user.activo:
        raise UnauthorizedError(_MSG_CREDENCIALES)
    if not verify_password(payload.contrasena, user.contrasena_hash):
        raise UnauthorizedError(_MSG_CREDENCIALES)

    token = create_access_token(subject=str(user.id))
    return TokenRespuesta(access_token=token)
