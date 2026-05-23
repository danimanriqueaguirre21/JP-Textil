from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from src.core.config import settings
from src.core.logging import configure_logging
from src.core.rate_limit import limiter
from src.core.security_checks import validate_settings
from src.shared.errors.exceptions import AppError
from src.shared.errors.handlers import (
    app_error_handler,
    request_validation_error_handler,
)
from src.modules.admin.presentation.routes import router as admin_router
from src.modules.auth.presentation.routes import router as auth_router
from src.modules.health.presentation.routes import router as health_router
from src.modules.predictions.presentation.routes import router as predictions_router
from src.modules.users.presentation.routes import router as users_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    validate_settings(settings)
    yield


configure_logging(settings.DEBUG)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, request_validation_error_handler)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(admin_router)
app.include_router(predictions_router)
