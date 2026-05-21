from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.modules.auth.infrastructure.security import decode_token
from src.modules.users.infrastructure.models import UserModel
from src.modules.users.presentation.schemas import UserPublic
from src.shared.db.session import get_db
from src.shared.errors.exceptions import UnauthorizedError


router = APIRouter(prefix="/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> UserModel:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token")
    user = db.execute(select(UserModel).where(UserModel.id == user_id)).scalar_one_or_none()
    if not user:
        raise UnauthorizedError("Invalid token")
    if not user.is_active:
        raise UnauthorizedError("User disabled")
    return user


@router.get("/me", response_model=UserPublic)
def me(current_user: UserModel = Depends(get_current_user)):
    return current_user
