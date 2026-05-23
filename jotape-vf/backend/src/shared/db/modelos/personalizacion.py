from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared.db.base import Base
from src.shared.db.modelos.mixins import MarcasTiempoMixin

if TYPE_CHECKING:
    from src.shared.db.modelos.catalogo import EstadoPersonalizacion, Talla
    from src.shared.db.modelos.productos import Producto, VarianteProducto
    from src.shared.db.modelos.usuarios import Usuario


class PedidoPersonalizado(Base, MarcasTiempoMixin):
    __tablename__ = "pedidos_personalizados"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", name="fk_pedidos_pers_usuario_id"),
        nullable=False,
        index=True,
    )
    producto_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("productos.id", ondelete="SET NULL", name="fk_pedidos_pers_producto_id"),
    )
    variante_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("variantes_producto.id", ondelete="SET NULL", name="fk_pedidos_pers_variante_id"),
    )
    estado_personalizacion_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("estados_personalizacion.id", name="fk_pedidos_pers_estado_id"),
        nullable=False,
        index=True,
    )
    numero_solicitud: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    texto_personalizado: Mapped[str | None] = mapped_column(String(500))
    color_solicitado: Mapped[str | None] = mapped_column(String(80))
    talla_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tallas.id", ondelete="SET NULL", name="fk_pedidos_pers_talla_id")
    )
    url_imagen_referencia: Mapped[str | None] = mapped_column(Text)
    descripcion: Mapped[str | None] = mapped_column(Text)
    presupuesto_estimado: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="PEN")
    notas_internas: Mapped[str | None] = mapped_column(Text)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    usuario: Mapped[Usuario] = relationship(back_populates="pedidos_personalizados")
    producto: Mapped[Producto | None] = relationship(back_populates="pedidos_personalizados")
    estado_personalizacion: Mapped[EstadoPersonalizacion] = relationship(
        back_populates="pedidos_personalizados"
    )
    disenos: Mapped[list[DisenoPersonalizado]] = relationship(back_populates="pedido_personalizado")
    historial_estados: Mapped[list[HistorialEstadoPersonalizacion]] = relationship(
        back_populates="pedido_personalizado"
    )


class DisenoPersonalizado(Base, MarcasTiempoMixin):
    __tablename__ = "disenos_personalizados"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pedido_personalizado_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "pedidos_personalizados.id",
            ondelete="CASCADE",
            name="fk_disenos_pedido_personalizado_id",
        ),
        nullable=False,
        index=True,
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE", name="fk_disenos_usuario_id"),
        nullable=False,
        index=True,
    )
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    url_vista_previa: Mapped[str | None] = mapped_column(Text)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    es_aprobado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    pedido_personalizado: Mapped[PedidoPersonalizado] = relationship(back_populates="disenos")
    usuario: Mapped[Usuario] = relationship(back_populates="disenos")
    archivos: Mapped[list[ArchivoDiseno]] = relationship(back_populates="diseno")


class ArchivoDiseno(Base, MarcasTiempoMixin):
    __tablename__ = "archivos_diseno"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    diseno_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("disenos_personalizados.id", ondelete="CASCADE", name="fk_archivos_diseno_id"),
        nullable=False,
        index=True,
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    nombre_archivo: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_mime: Mapped[str] = mapped_column(String(120), nullable=False)
    tamano_bytes: Mapped[int | None] = mapped_column(BigInteger)
    es_principal: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    diseno: Mapped[DisenoPersonalizado] = relationship(back_populates="archivos")


class HistorialEstadoPersonalizacion(Base):
    __tablename__ = "historial_estados_personalizacion"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pedido_personalizado_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "pedidos_personalizados.id",
            ondelete="CASCADE",
            name="fk_hist_pers_pedido_id",
        ),
        nullable=False,
        index=True,
    )
    estado_personalizacion_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("estados_personalizacion.id", name="fk_hist_pers_estado_id"),
        nullable=False,
    )
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL", name="fk_hist_pers_usuario_id"),
    )
    comentario: Mapped[str | None] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    pedido_personalizado: Mapped[PedidoPersonalizado] = relationship(
        back_populates="historial_estados"
    )
    estado_personalizacion: Mapped[EstadoPersonalizacion] = relationship(
        back_populates="historial"
    )
