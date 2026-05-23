from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared.db.base import Base
from src.shared.db.modelos.mixins import MarcasTiempoMixin

if TYPE_CHECKING:
    from src.shared.db.modelos.comercio import HistorialEstadoPedido, Pedido
    from src.shared.db.modelos.personalizacion import (
        HistorialEstadoPersonalizacion,
        PedidoPersonalizado,
    )
    from src.shared.db.modelos.productos import Producto
    from src.shared.db.modelos.usuarios import Usuario


class Rol(Base, MarcasTiempoMixin):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    codigo: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    usuarios: Mapped[list[Usuario]] = relationship(back_populates="rol")


class Categoria(Base, MarcasTiempoMixin):
    __tablename__ = "categorias"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    categoria_padre_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categorias.id", ondelete="SET NULL"),
        index=True,
    )
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    imagen_url: Mapped[str | None] = mapped_column(Text)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    padre: Mapped[Categoria | None] = relationship(
        remote_side=[id], back_populates="hijos"
    )
    hijos: Mapped[list[Categoria]] = relationship(back_populates="padre")
    productos: Mapped[list[Producto]] = relationship(back_populates="categoria")


class Talla(Base, MarcasTiempoMixin):
    __tablename__ = "tallas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    codigo: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(40), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Color(Base, MarcasTiempoMixin):
    __tablename__ = "colores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    codigo: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    hex: Mapped[str | None] = mapped_column(String(7))
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class EstadoPedido(Base, MarcasTiempoMixin):
    __tablename__ = "estados_pedido"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    codigo: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    es_final: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    pedidos: Mapped[list[Pedido]] = relationship(back_populates="estado_pedido")
    historial: Mapped[list[HistorialEstadoPedido]] = relationship(
        back_populates="estado_pedido"
    )


class EstadoPersonalizacion(Base, MarcasTiempoMixin):
    __tablename__ = "estados_personalizacion"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    codigo: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    es_final: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    pedidos_personalizados: Mapped[list[PedidoPersonalizado]] = relationship(
        back_populates="estado_personalizacion"
    )
    historial: Mapped[list[HistorialEstadoPersonalizacion]] = relationship(
        back_populates="estado_personalizacion"
    )
