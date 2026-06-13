from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.modules.users.infrastructure.measurements_repo import (
    create_measurement,
    get_current_measurement,
)
from src.modules.users.presentation.measurement_schemas import (
    MedidaUsuarioCrear,
    MedidaUsuarioPublica,
)
from src.modules.users.presentation.schemas import UsuarioPublico
from src.shared.auth.deps import get_current_user
from src.shared.db.modelos import Usuario
from src.shared.db.session import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UsuarioPublico)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.get("/me/measurements/current", response_model=MedidaUsuarioPublica)
def measurements_current(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = get_current_measurement(db, current_user.id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sin medidas")
    return row


@router.post(
    "/me/measurements",
    response_model=MedidaUsuarioPublica,
    status_code=status.HTTP_201_CREATED,
)
def measurements_create(
    payload: MedidaUsuarioCrear,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_measurement(db, current_user.id, payload)

