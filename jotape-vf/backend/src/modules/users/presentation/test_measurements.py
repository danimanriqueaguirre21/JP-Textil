from decimal import Decimal

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.modules.users.infrastructure.measurements_repo import (
    create_measurement,
    get_current_measurement,
)
from src.modules.users.presentation.measurement_schemas import MedidaUsuarioCrear
from src.shared.db.modelos import MedidaUsuario, Rol, Usuario
from src.modules.auth.infrastructure.security import hash_password


@pytest.fixture()
def db() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Rol.__table__.create(engine, checkfirst=True)
    Usuario.__table__.create(engine, checkfirst=True)
    MedidaUsuario.__table__.create(engine, checkfirst=True)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def _seed_user(db: Session) -> Usuario:
    rol = Rol(codigo="cliente", nombre="Cliente")
    db.add(rol)
    db.flush()
    user = Usuario(
        rol_id=rol.id,
        email="scan@test.local",
        contrasena_hash=hash_password("TestPass123!"),
        nombre_completo="Scan Test",
        activo=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_create_and_get_current_measurement(db: Session) -> None:
    user = _seed_user(db)
    payload = MedidaUsuarioCrear(
        altura_cm=175,
        peso_kg=70,
        pecho_cm=96,
        cintura_cm=82,
        cadera_cm=98,
        hombro_cm=45,
        fuente="body_scan",
    )
    row = create_measurement(db, user.id, payload)
    assert row.es_actual is True
    assert row.altura_cm == Decimal("175")

    current = get_current_measurement(db, user.id)
    assert current is not None
    assert current.id == row.id


def test_new_measurement_supersedes_previous(db: Session) -> None:
    user = _seed_user(db)
    first = create_measurement(
        db,
        user.id,
        MedidaUsuarioCrear(altura_cm=170, peso_kg=68, fuente="manual"),
    )
    second = create_measurement(
        db,
        user.id,
        MedidaUsuarioCrear(altura_cm=180, peso_kg=75, fuente="body_scan"),
    )

    db.refresh(first)
    assert first.es_actual is False
    assert second.es_actual is True

    current = get_current_measurement(db, user.id)
    assert current is not None
    assert current.altura_cm == Decimal("180")
