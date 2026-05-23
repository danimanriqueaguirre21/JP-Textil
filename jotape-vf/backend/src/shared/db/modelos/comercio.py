from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared.db.base import Base
from src.shared.db.modelos.mixins import MarcasTiempoMixin

if TYPE_CHECKING:
    from src.shared.db.modelos.catalogo import EstadoPedido
    from src.shared.db.modelos.productos import VarianteProducto
    from src.shared.db.modelos.usuarios import Usuario


class Carrito(Base, MarcasTiempoMixin):
    __tablename__ = "carrito"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE", name="fk_carrito_usuario_id"),
        index=True,
    )
    token_sesion: Mapped[str | None] = mapped_column(String(128), unique=True)
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="PEN")
    expira_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    usuario: Mapped[Usuario | None] = relationship(back_populates="carritos")
    detalles: Mapped[list[CarritoDetalle]] = relationship(back_populates="carrito")


class CarritoDetalle(Base, MarcasTiempoMixin):
    __tablename__ = "carrito_detalle"
    __table_args__ = (
        UniqueConstraint("carrito_id", "variante_id", name="uq_carrito_detalle_variante"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    carrito_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("carrito.id", ondelete="CASCADE", name="fk_carrito_detalle_carrito_id"),
        nullable=False,
        index=True,
    )
    variante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("variantes_producto.id", name="fk_carrito_detalle_variante_id"),
        nullable=False,
        index=True,
    )
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    carrito: Mapped[Carrito] = relationship(back_populates="detalles")
    variante: Mapped[VarianteProducto] = relationship(back_populates="carrito_detalles")


class Pedido(Base, MarcasTiempoMixin):
    __tablename__ = "pedidos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", name="fk_pedidos_usuario_id"),
        nullable=False,
        index=True,
    )
    estado_pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("estados_pedido.id", name="fk_pedidos_estado_id"),
        nullable=False,
        index=True,
    )
    numero_pedido: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    descuento: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    costo_envio: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    impuestos: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="PEN")
    direccion_envio: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    notas_cliente: Mapped[str | None] = mapped_column(Text)

    usuario: Mapped[Usuario] = relationship(back_populates="pedidos")
    estado_pedido: Mapped[EstadoPedido] = relationship(back_populates="pedidos")
    detalles: Mapped[list[PedidoDetalle]] = relationship(back_populates="pedido")
    pagos: Mapped[list[Pago]] = relationship(back_populates="pedido")
    envio: Mapped[Envio | None] = relationship(back_populates="pedido")
    historial_estados: Mapped[list[HistorialEstadoPedido]] = relationship(
        back_populates="pedido"
    )


class PedidoDetalle(Base, MarcasTiempoMixin):
    __tablename__ = "pedido_detalle"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pedidos.id", ondelete="CASCADE", name="fk_pedido_detalle_pedido_id"),
        nullable=False,
        index=True,
    )
    variante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("variantes_producto.id", name="fk_pedido_detalle_variante_id"),
        nullable=False,
        index=True,
    )
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    subtotal_linea: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    nombre_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    sku_snapshot: Mapped[str] = mapped_column(String(80), nullable=False)

    pedido: Mapped[Pedido] = relationship(back_populates="detalles")
    variante: Mapped[VarianteProducto] = relationship(back_populates="pedido_detalles")


class Pago(Base, MarcasTiempoMixin):
    __tablename__ = "pagos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pedidos.id", ondelete="CASCADE", name="fk_pagos_pedido_id"),
        nullable=False,
        index=True,
    )
    metodo: Mapped[str] = mapped_column(String(40), nullable=False)
    proveedor: Mapped[str | None] = mapped_column(String(60))
    referencia_externa: Mapped[str | None] = mapped_column(String(120))
    monto: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="PEN")
    estado: Mapped[str] = mapped_column(String(30), nullable=False, default="pendiente")
    pagado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    pedido: Mapped[Pedido] = relationship(back_populates="pagos")


class Envio(Base, MarcasTiempoMixin):
    __tablename__ = "envios"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pedidos.id", ondelete="CASCADE", name="fk_envios_pedido_id"),
        unique=True,
        nullable=False,
    )
    transportista: Mapped[str | None] = mapped_column(String(80))
    numero_seguimiento: Mapped[str | None] = mapped_column(String(120))
    estado: Mapped[str] = mapped_column(String(30), nullable=False, default="pendiente")
    costo: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    fecha_estimada: Mapped[date | None] = mapped_column(Date)
    enviado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    entregado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    direccion_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    pedido: Mapped[Pedido] = relationship(back_populates="envio")


class HistorialEstadoPedido(Base):
    __tablename__ = "historial_estados_pedido"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pedidos.id", ondelete="CASCADE", name="fk_historial_pedido_id"),
        nullable=False,
        index=True,
    )
    estado_pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("estados_pedido.id", name="fk_historial_estado_id"),
        nullable=False,
    )
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL", name="fk_historial_usuario_id"),
    )
    comentario: Mapped[str | None] = mapped_column(Text)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    pedido: Mapped[Pedido] = relationship(back_populates="historial_estados")
    estado_pedido: Mapped[EstadoPedido] = relationship(back_populates="historial")
