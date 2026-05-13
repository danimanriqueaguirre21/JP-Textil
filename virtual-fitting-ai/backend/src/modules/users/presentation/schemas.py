import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserPublic(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool
    created_at: datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

