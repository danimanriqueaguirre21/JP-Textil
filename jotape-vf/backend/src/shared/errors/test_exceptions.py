from src.shared.errors.exceptions import (
    AppError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)


def test_app_error_default() -> None:
    err = AppError()
    assert err.status_code == 500
    assert err.code == "internal_error"


def test_app_error_custom_message() -> None:
    err = AppError("boom")
    assert err.message == "boom"


def test_not_found_error() -> None:
    err = NotFoundError("x")
    assert err.status_code == 404
    assert err.code == "not_found"


def test_conflict_error() -> None:
    err = ConflictError("dup")
    assert err.status_code == 409


def test_unauthorized_error() -> None:
    err = UnauthorizedError("bad")
    assert err.status_code == 401


def test_validation_error() -> None:
    err = ValidationError("invalid")
    assert err.status_code == 422
