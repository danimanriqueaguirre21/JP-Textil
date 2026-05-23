from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared.db.base import Base
from src.shared.db.modelos.mixins import MarcasTiempoMixin

if TYPE_CHECKING:
    from src.shared.db.modelos.catalogo import Rol
    from src.shared.db.modelos.comercio import Carrito, Pedido
    from src.shared.db.modelos.personalizacion import DisenoPersonalizado, PedidoPersonalizado
    from src.shared.db.modelos.probador import AvatarUsuario, MedidaUsuario, RecomendacionTalla, SesionProbador


class Usuario(Base, MarcasTiempoMixin):
    __tablename__ = "usuarios"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    rol_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", name="fk_usuarios_rol_id"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    contrasena_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nombre_completo: Mapped[str | None] = mapped_column(String(200))
    telefono: Mapped[str | None] = mapped_column(String(30))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    email_verificado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    ultimo_acceso_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    rol: Mapped[Rol] = relationship(back_populates="usuarios")
    direcciones: Mapped[list[DireccionUsuario]] = relationship(back_populates="usuario")
    carritos: Mapped[list[Carrito]] = relationship(back_populates="usuario")
    pedidos: Mapped[list[Pedido]] = relationship(back_populates="usuario")
    medidas: Mapped[list[MedidaUsuario]] = relationship(back_populates="usuario")
    recomendaciones: Mapped[list[RecomendacionTalla]] = relationship(back_populates="usuario")
    avatares: Mapped[list[AvatarUsuario]] = relationship(back_populates="usuario")
    sesiones_probador: Mapped[list[SesionProbador]] = relationship(back_populates="usuario")
    pedidos_personalizados: Mapped[list[PedidoPersonalizado]] = relationship(
        back_populates="usuario"
    )
    disenos: Mapped[list[DisenoPersonalizado]] = relationship(back_populates="usuario")


class DireccionUsuario(Base, MarcasTiempoMixin):
    __tablename__ = "direcciones_usuario"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE", name="fk_direcciones_usuario_id"),
        nullable=False,
        index=True,
    )
    etiqueta: Mapped[str | None] = mapped_column(String(80))
    destinatario: Mapped[str] = mapped_column(String(200), nullable=False)
    linea_1: Mapped[str] = mapped_column(String(255), nullable=False)
    linea_2: Mapped[str | None] = mapped_column(String(255))
    ciudad: Mapped[str] = mapped_column(String(120), nullable=False)
    provincia: Mapped[str | None] = mapped_column(String(120))
    codigo_postal: Mapped[str | None] = mapped_column(String(20))
    pais: Mapped[str] = mapped_column(String(2), nullable=False, default="PE")
    telefono: Mapped[str | None] = mapped_column(String(30))
    es_predeterminada: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    usuario: Mapped[Usuario] = relationship(back_populates="direcciones")
