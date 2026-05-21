import jwt
import pytest

from src.modules.auth.infrastructure.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from src.shared.errors.exceptions import UnauthorizedError


def test_hash_and_verify_round_trip() -> None:
    raw = "my-long-password-123"
    hashed = hash_password(raw)
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong", hashed) is False


def test_create_and_decode_token_round_trip() -> None:
    token = create_access_token(subject="user-1")
    payload = decode_token(token)
    assert payload["sub"] == "user-1"
    assert "exp" in payload


def test_decode_invalid_token_raises() -> None:
    with pytest.raises(UnauthorizedError):
        decode_token("not-a-jwt")


def test_decode_tampered_token_raises() -> None:
    token = create_access_token(subject="abc")
    parts = token.split(".")
    assert len(parts) == 3
    bad = f"{parts[0]}.{parts[1]}.xxx"
    with pytest.raises(UnauthorizedError):
        decode_token(bad)


def test_decode_wrong_secret_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    token = jwt.encode({"sub": "1"}, "other-secret", algorithm="HS256")
    with pytest.raises(UnauthorizedError):
        decode_token(token)
