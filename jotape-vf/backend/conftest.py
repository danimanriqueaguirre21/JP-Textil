"""Fixtures compartidos de Pytest (raíz backend; los casos viven junto a cada módulo en `src/`)."""

from __future__ import annotations

import os

import pytest
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker


def pytest_configure() -> None:
    """Valores por defecto antes de importar `src` (el engine lee env al importarse)."""
    defaults = {
        "DATABASE_HOST": "127.0.0.1",
        "DATABASE_PORT": "5432",
        "DATABASE_NAME": "jotape_test",
        "DATABASE_USER": "postgres",
        "DATABASE_PASSWORD": "postgres",
        "JWT_SECRET_KEY": "test-secret-key",
        "JWT_ALGORITHM": "HS256",
        "JWT_ACCESS_TOKEN_EXPIRES_MINUTES": "60",
        "RATE_LIMIT_ENABLED": "false",
    }
    for key, value in defaults.items():
        os.environ.setdefault(key, value)


@pytest.fixture
def api_client():
    """Cliente HTTP contra la app (rutas que no requieren tablas en BD)."""
    from starlette.testclient import TestClient

    from src.main import app

    return TestClient(app)


@pytest.fixture(scope="session")
def db_engine():
    """Motor PostgreSQL; se omite la suite que lo requiere si no hay servidor."""
    from src.shared.db.base import Base
    from src.shared.db import modelos  # noqa: F401
    from src.shared.db.engine import engine
    from src.shared.db.semillas import asegurar_roles

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except OSError as exc:
        pytest.skip(f"PostgreSQL no disponible: {exc}")
    except Exception as exc:  # noqa: BLE001 — diagnóstico de conexión en CI/local
        pytest.skip(f"PostgreSQL no disponible: {exc}")

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        asegurar_roles(session)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine)
    with Session() as session:
        yield session


@pytest.fixture
def api_client_db(db_engine):
    """Cliente HTTP con esquema creado en la sesión de tests."""
    from sqlalchemy import delete

    from starlette.testclient import TestClient

    from src.main import app
    from src.shared.db.modelos import Usuario

    Session = sessionmaker(bind=db_engine)

    def wipe() -> None:
        with Session() as session:
            session.execute(delete(Usuario))
            session.commit()

    wipe()
    yield TestClient(app)
    wipe()
