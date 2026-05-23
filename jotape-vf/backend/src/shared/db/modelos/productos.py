from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared.db.base import Base
from src.shared.db.modelos.mixins import MarcasTiempoMixin

if TYPE_CHECKING:
    from src.shared.db.modelos.catalogo import Categoria, Color, Talla
    from src.shared.db.modelos.comercio import CarritoDetalle, PedidoDetalle
    from src.shared.db.modelos.personalizacion import PedidoPersonalizado
    from src.shared.db.modelos.probador import RecomendacionTalla, SesionProbador


class Producto(Base, MarcasTiempoMixin):
    __tablename__ = "productos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    categoria_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categorias.id", name="fk_productos_categoria_id"),
        nullable=False,
        index=True,
    )
    slug: Mapped[str] = mapped_column(String(160), unique=True, nullable=False, index=True)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    descripcion_corta: Mapped[str | None] = mapped_column(String(500))
    precio_base: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    moneda: Mapped[str] = mapped_column(String(3), nullable=False, default="PEN")
    genero_objetivo: Mapped[str | None] = mapped_column(String(20))
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    destacado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    categoria: Mapped[Categoria] = relationship(back_populates="productos")
    imagenes: Mapped[list[ImagenProducto]] = relationship(back_populates="producto")
    variantes: Mapped[list[VarianteProducto]] = relationship(back_populates="producto")
    prendas_3d: Mapped[list[Prenda3d]] = relationship(back_populates="producto")
    recomendaciones: Mapped[list[RecomendacionTalla]] = relationship(back_populates="producto")
    pedidos_personalizados: Mapped[list[PedidoPersonalizado]] = relationship(
        back_populates="producto"
    )


class ImagenProducto(Base, MarcasTiempoMixin):
    __tablename__ = "imagenes_producto"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    producto_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("productos.id", ondelete="CASCADE", name="fk_imagenes_producto_id"),
        nullable=False,
        index=True,
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    texto_alt: Mapped[str | None] = mapped_column(String(255))
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    es_principal: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    producto: Mapped[Producto] = relationship(back_populates="imagenes")


class VarianteProducto(Base, MarcasTiempoMixin):
    __tablename__ = "variantes_producto"
    __table_args__ = (
        UniqueConstraint(
            "producto_id", "talla_id", "color_id", name="uq_variantes_producto_talla_color"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    producto_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("productos.id", ondelete="CASCADE", name="fk_variantes_producto_id"),
        nullable=False,
        index=True,
    )
    talla_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tallas.id", name="fk_variantes_talla_id"),
        nullable=False,
        index=True,
    )
    color_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("colores.id", name="fk_variantes_color_id"),
        nullable=False,
        index=True,
    )
    sku: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    precio: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    existencias: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    producto: Mapped[Producto] = relationship(back_populates="variantes")
    talla: Mapped[Talla] = relationship()
    color: Mapped[Color] = relationship()
    medidas: Mapped[MedidaPrenda | None] = relationship(back_populates="variante")
    carrito_detalles: Mapped[list[CarritoDetalle]] = relationship(back_populates="variante")
    pedido_detalles: Mapped[list[PedidoDetalle]] = relationship(back_populates="variante")
    sesiones_probador: Mapped[list[SesionProbador]] = relationship(back_populates="variante")


class MedidaPrenda(Base, MarcasTiempoMixin):
    __tablename__ = "medidas_prenda"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    variante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "variantes_producto.id",
            ondelete="CASCADE",
            name="fk_medidas_prenda_variante_id",
        ),
        unique=True,
        nullable=False,
    )
    largo_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    ancho_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    manga_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    hombro_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    pecho_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    cintura_cm: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    calce: Mapped[str] = mapped_column(String(30), nullable=False, default="regular")
    notas: Mapped[str | None] = mapped_column(Text)

    variante: Mapped[VarianteProducto] = relationship(back_populates="medidas")


class Prenda3d(Base, MarcasTiempoMixin):
    __tablename__ = "prendas_3d"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    producto_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("productos.id", ondelete="SET NULL", name="fk_prendas_3d_producto_id"),
        index=True,
    )
    codigo: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(160), nullable=False)
    tipo_prenda: Mapped[str] = mapped_column(String(40), nullable=False)
    genero: Mapped[str] = mapped_column(String(20), nullable=False, default="unisex")
    url_glb: Mapped[str] = mapped_column(Text, nullable=False)
    url_usdz: Mapped[str | None] = mapped_column(Text)
    url_miniatura: Mapped[str | None] = mapped_column(Text)
    escala_base: Mapped[Decimal] = mapped_column(Numeric(6, 4), nullable=False, default=1)
    metadatos: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    producto: Mapped[Producto | None] = relationship(back_populates="prendas_3d")
    sesiones: Mapped[list[SesionProbador]] = relationship(back_populates="prenda_3d")
