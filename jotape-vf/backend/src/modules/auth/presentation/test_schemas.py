import pytest
from pydantic import ValidationError

from src.modules.auth.presentation.schemas import LoginRequest, TokenResponse


def test_token_response_defaults() -> None:
    t = TokenResponse(access_token="abc")
    assert t.token_type == "bearer"


def test_login_request_validates_email() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(email="not-an-email", password="x")
