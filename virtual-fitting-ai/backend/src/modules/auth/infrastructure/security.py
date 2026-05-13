from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from src.core.config import settings
from src.shared.errors.exceptions import UnauthorizedError


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRES_MINUTES)
    payload = {"sub": subject, "iat": int(now.timestamp()), "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.PyJWTError as e:
        raise UnauthorizedError("Invalid token") from e

