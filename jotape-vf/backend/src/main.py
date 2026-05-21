from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

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
from src.modules.predictions.presentation.routes import router as predictions_router


configure_logging(settings.DEBUG)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

# Orígenes del frontend Next.js (ajusta en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, request_validation_error_handler)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(predictions_router)

