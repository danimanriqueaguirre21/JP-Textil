from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared.db.base import Base
from src.shared.db.modelos.mixins import MarcasTiempoMixin

if TYPE_CHECKING:
    from src.shared.db.modelos.catalogo import Talla
    from src.shared.db.modelos.productos import Prenda3d, Producto, VarianteProducto
    from src.shared.db.modelos.usuarios import Usuario


class MedidaUsuario(Base, MarcasTiempoMixin):
    __tablename__ = "medidas_usuario"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE", name="fk_medidas_usuario_id"),
        nullable=False,
        index=True,
    )
    altura_cm: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    peso_kg: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    pecho_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    cintura_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    cadera_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    hombro_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    fuente: Mapped[str] = mapped_column(String(40), nullable=False, default="manual")
    es_actual: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    medido_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )

    usuario: Mapped[Usuario] = relationship(back_populates="medidas")


class RecomendacionTalla(Base, MarcasTiempoMixin):
    __tablename__ = "recomendaciones_talla"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE", name="fk_recomendaciones_usuario_id"),
        nullable=False,
        index=True,
    )
    producto_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("productos.id", ondelete="SET NULL", name="fk_recomendaciones_producto_id"),
        index=True,
    )
    variante_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("variantes_producto.id", ondelete="SET NULL", name="fk_recomendaciones_variante_id"),
    )
    talla_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tallas.id", name="fk_recomendaciones_talla_id"),
        nullable=False,
    )
    nivel_confianza: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    explicacion: Mapped[str] = mapped_column(Text, nullable=False)
    version_modelo: Mapped[str] = mapped_column(String(60), nullable=False, default="heuristic-v0")
    entrada: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    salida: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    aceptada_por_usuario: Mapped[bool | None] = mapped_column(Boolean)

    usuario: Mapped[Usuario] = relationship(back_populates="recomendaciones")
    producto: Mapped[Producto | None] = relationship(back_populates="recomendaciones")
    talla: Mapped[Talla] = relationship()


class AvatarUsuario(Base, MarcasTiempoMixin):
    __tablename__ = "avatares_usuario"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE", name="fk_avatares_usuario_id"),
        nullable=False,
        index=True,
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False, default="Mi avatar")
    genero: Mapped[str] = mapped_column(String(20), nullable=False)
    url_modelo_glb: Mapped[str] = mapped_column(Text, nullable=False)
    url_usdz: Mapped[str | None] = mapped_column(Text)
    altura_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    escala: Mapped[Decimal] = mapped_column(Numeric(6, 4), nullable=False, default=1)
    es_predeterminado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    usuario: Mapped[Usuario] = relationship(back_populates="avatares")
    sesiones: Mapped[list[SesionProbador]] = relationship(back_populates="avatar")


class SesionProbador(Base, MarcasTiempoMixin):
    __tablename__ = "sesiones_probador"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL", name="fk_sesiones_usuario_id"),
        index=True,
    )
    avatar_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("avatares_usuario.id", ondelete="SET NULL", name="fk_sesiones_avatar_id"),
    )
    prenda_3d_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prendas_3d.id", ondelete="SET NULL", name="fk_sesiones_prenda_id"),
    )
    variante_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("variantes_producto.id", ondelete="SET NULL", name="fk_sesiones_variante_id"),
    )
    talla_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tallas.id", ondelete="SET NULL", name="fk_sesiones_talla_id"),
    )
    token_sesion: Mapped[str | None] = mapped_column(String(128))
    dispositivo: Mapped[str | None] = mapped_column(String(80))
    iniciada_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="now()"
    )
    finalizada_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    eventos: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    usuario: Mapped[Usuario | None] = relationship(back_populates="sesiones_probador")
    avatar: Mapped[AvatarUsuario | None] = relationship(back_populates="sesiones")
    prenda_3d: Mapped[Prenda3d | None] = relationship(back_populates="sesiones")
    variante: Mapped[VarianteProducto | None] = relationship(back_populates="sesiones_probador")
