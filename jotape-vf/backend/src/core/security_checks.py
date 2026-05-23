"""Validaciones de configuración segura al arranque."""

from src.core.config import Settings

_WEAK_JWT_SECRETS = frozenset(
    {
        "",
        "change-me",
        "secret",
        "jwt-secret",
        "test-secret-key",
        "dev",
    }
)


def validate_settings(cfg: Settings) -> None:
    if cfg.ENVIRONMENT != "production":
        return

    if cfg.DEBUG:
        raise RuntimeError("DEBUG debe ser false en producción")

    if len(cfg.JWT_SECRET_KEY) < 32 or cfg.JWT_SECRET_KEY in _WEAK_JWT_SECRETS:
        raise RuntimeError(
            "JWT_SECRET_KEY débil: usa al menos 32 caracteres aleatorios en producción"
        )
