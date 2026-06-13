import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MedidaUsuarioCrear(BaseModel):
    altura_cm: float = Field(gt=120, lt=230)
    peso_kg: float = Field(gt=30, lt=250)
    pecho_cm: float | None = Field(default=None, gt=0, lt=200)
    cintura_cm: float | None = Field(default=None, gt=0, lt=200)
    cadera_cm: float | None = Field(default=None, gt=0, lt=200)
    hombro_cm: float | None = Field(default=None, gt=0, lt=100)
    fuente: str = Field(default="body_scan", max_length=40)
    metadatos: dict = Field(default_factory=dict)


class MedidaUsuarioPublica(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    altura_cm: Decimal
    peso_kg: Decimal
    pecho_cm: Decimal | None
    cintura_cm: Decimal | None
    cadera_cm: Decimal | None
    hombro_cm: Decimal | None
    fuente: str
    es_actual: bool
    medido_en: datetime
