import asyncio
from unittest.mock import MagicMock

from fastapi.exceptions import RequestValidationError

from src.shared.errors.exceptions import ConflictError, NotFoundError, UnauthorizedError
from src.shared.errors.handlers import app_error_handler, request_validation_error_handler


def test_app_error_handler_conflict() -> None:
    async def run() -> None:
        req = MagicMock()
        res = await app_error_handler(req, ConflictError("duplicate"))
        assert res.status_code == 409
        body = res.json()
        assert body["error"]["code"] == "conflict"

    asyncio.run(run())


def test_app_error_handler_unauthorized() -> None:
    async def run() -> None:
        req = MagicMock()
        res = await app_error_handler(req, UnauthorizedError("nope"))
        assert res.status_code == 401

    asyncio.run(run())


def test_app_error_handler_not_found() -> None:
    async def run() -> None:
        req = MagicMock()
        res = await app_error_handler(req, NotFoundError("missing"))
        assert res.status_code == 404

    asyncio.run(run())


def test_request_validation_error_handler() -> None:
    async def run() -> None:
        req = MagicMock()
        exc = RequestValidationError(
            [{"type": "missing", "loc": ("body", "field"), "msg": "required"}]
        )
        res = await request_validation_error_handler(req, exc)
        assert res.status_code == 422
        data = res.json()
        assert data["error"]["code"] == "validation_error"
        assert data["error"]["details"] is not None

    asyncio.run(run())
