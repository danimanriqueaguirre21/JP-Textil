"""esquema inicial jotape vf

Revision ID: 20260521_0001
Revises:
Create Date: 2026-05-21

Esquema relacional 100 % en español para JotaPe VF.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from src.shared.db.base import Base
from src.shared.db import modelos  # noqa: F401

revision: str = "20260521_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    op.execute(
        """
        CREATE OR REPLACE FUNCTION establecer_actualizado_en()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.actualizado_en = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)

    op.execute(
        """
        INSERT INTO roles (id, codigo, nombre, descripcion, activo)
        VALUES
          (gen_random_uuid(), 'admin', 'Administrador', 'Acceso total al panel', TRUE),
          (gen_random_uuid(), 'cliente', 'Cliente', 'Compras y probador virtual', TRUE),
          (gen_random_uuid(), 'operador', 'Operador', 'Gestión de pedidos y personalización', TRUE)
        ON CONFLICT (codigo) DO NOTHING;
        """
    )

    # Triggers de actualizado_en en tablas con MarcasTiempoMixin
    tablas_con_auditoria = [
        "roles",
        "usuarios",
        "direcciones_usuario",
        "categorias",
        "productos",
        "imagenes_producto",
        "tallas",
        "colores",
        "variantes_producto",
        "medidas_prenda",
        "estados_pedido",
        "carrito",
        "carrito_detalle",
        "pedidos",
        "pedido_detalle",
        "pagos",
        "envios",
        "medidas_usuario",
        "recomendaciones_talla",
        "prendas_3d",
        "avatares_usuario",
        "sesiones_probador",
        "estados_personalizacion",
        "pedidos_personalizados",
        "disenos_personalizados",
        "archivos_diseno",
    ]
    for tabla in tablas_con_auditoria:
        op.execute(
            f"""
            DROP TRIGGER IF EXISTS trg_{tabla}_actualizado_en ON {tabla};
            CREATE TRIGGER trg_{tabla}_actualizado_en
              BEFORE UPDATE ON {tabla}
              FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
    op.execute("DROP FUNCTION IF EXISTS establecer_actualizado_en() CASCADE")
