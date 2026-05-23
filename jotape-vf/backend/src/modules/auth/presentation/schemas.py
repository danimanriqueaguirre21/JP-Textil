from pydantic import BaseModel, EmailStr, Field


class InicioSesionSolicitud(BaseModel):
    email: EmailStr
    contrasena: str


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Alias retrocompatible para imports existentes en tests
LoginRequest = InicioSesionSolicitud
TokenResponse = TokenRespuesta
