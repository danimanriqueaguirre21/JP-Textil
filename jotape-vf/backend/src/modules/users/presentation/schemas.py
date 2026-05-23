import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioPublico(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    nombre_completo: str | None = None
    activo: bool
    creado_en: datetime


class UsuarioCrear(BaseModel):
    email: EmailStr
    contrasena: str = Field(min_length=8)
    nombre_completo: str | None = None
