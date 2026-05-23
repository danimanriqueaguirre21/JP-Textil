import pytest
from pydantic import ValidationError

from src.modules.users.presentation.schemas import UsuarioCrear


def test_usuario_crear_acepta_nombre_opcional() -> None:
    u = UsuarioCrear(email="a@example.com", contrasena="secret123")
    assert u.nombre_completo is None


def test_usuario_crear_valida_email() -> None:
    with pytest.raises(ValidationError):
        UsuarioCrear(email="bad", contrasena="x")
