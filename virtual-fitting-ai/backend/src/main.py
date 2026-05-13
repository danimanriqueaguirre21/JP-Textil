from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from src.core.config import settings
from src.core.logging import configure_logging
from src.shared.errors.exceptions import AppError
from src.shared.errors.handlers import (
    app_error_handler,
    request_validation_error_handler,
)
from src.modules.health.presentation.routes import router as health_router
from src.modules.auth.presentation.routes import router as auth_router
from src.modules.users.presentation.routes import router as users_router


configure_logging(settings.DEBUG)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, request_validation_error_handler)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)

