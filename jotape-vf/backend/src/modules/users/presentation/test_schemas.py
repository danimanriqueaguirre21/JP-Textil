import pytest
from pydantic import ValidationError

from src.modules.users.presentation.schemas import UserCreate


def test_user_create_accepts_optional_name() -> None:
    u = UserCreate(email="a@example.com", password="secret123")
    assert u.full_name is None


def test_user_create_validates_email() -> None:
    with pytest.raises(ValidationError):
        UserCreate(email="bad", password="x")
