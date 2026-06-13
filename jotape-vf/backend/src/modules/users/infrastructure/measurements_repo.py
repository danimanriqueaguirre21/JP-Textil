from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from src.modules.users.presentation.measurement_schemas import MedidaUsuarioCrear
from src.shared.db.modelos import MedidaUsuario


def get_current_measurement(db: Session, usuario_id: uuid.UUID) -> MedidaUsuario | None:
    stmt = (
        select(MedidaUsuario)
        .where(
            MedidaUsuario.usuario_id == usuario_id,
            MedidaUsuario.es_actual.is_(True),
        )
        .order_by(MedidaUsuario.medido_en.desc())
        .limit(1)
    )
    return db.scalar(stmt)


def create_measurement(
    db: Session,
    usuario_id: uuid.UUID,
    payload: MedidaUsuarioCrear,
) -> MedidaUsuario:
    db.execute(
        update(MedidaUsuario)
        .where(
            MedidaUsuario.usuario_id == usuario_id,
            MedidaUsuario.es_actual.is_(True),
        )
        .values(es_actual=False)
    )

    row = MedidaUsuario(
        usuario_id=usuario_id,
        altura_cm=Decimal(str(round(payload.altura_cm, 2))),
        peso_kg=Decimal(str(round(payload.peso_kg, 2))),
        pecho_cm=_dec(payload.pecho_cm),
        cintura_cm=_dec(payload.cintura_cm),
        cadera_cm=_dec(payload.cadera_cm),
        hombro_cm=_dec(payload.hombro_cm),
        fuente=payload.fuente,
        es_actual=True,
        medido_en=datetime.now(timezone.utc),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _dec(value: float | None) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(round(value, 2)))
