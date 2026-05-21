from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.modules.auth.infrastructure.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from src.modules.auth.presentation.schemas import LoginRequest, TokenResponse
from src.modules.users.infrastructure.models import UserModel
from src.modules.users.presentation.schemas import UserCreate, UserPublic
from src.shared.db.session import get_db
from src.shared.errors.exceptions import ConflictError, UnauthorizedError


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(UserModel).where(UserModel.email == payload.email)).scalar_one_or_none()
    if existing:
        raise ConflictError("Email already registered")

    user = UserModel(
        email=str(payload.email).lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(UserModel).where(UserModel.email == payload.email)).scalar_one_or_none()
    if not user:
        raise UnauthorizedError("Invalid credentials")
    if not user.is_active:
        raise UnauthorizedError("User disabled")
    if not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedError("Invalid credentials")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)

