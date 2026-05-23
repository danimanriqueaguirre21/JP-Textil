"""Modelos ORM JotaPe VF — esquema 100 % en español."""

from src.shared.db.modelos.catalogo import (
    Categoria,
    Color,
    EstadoPedido,
    EstadoPersonalizacion,
    Rol,
    Talla,
)
from src.shared.db.modelos.comercio import (
    Carrito,
    CarritoDetalle,
    Envio,
    HistorialEstadoPedido,
    Pago,
    Pedido,
    PedidoDetalle,
)
from src.shared.db.modelos.personalizacion import (
    ArchivoDiseno,
    DisenoPersonalizado,
    HistorialEstadoPersonalizacion,
    PedidoPersonalizado,
)
from src.shared.db.modelos.probador import (
    AvatarUsuario,
    MedidaUsuario,
    RecomendacionTalla,
    SesionProbador,
)
from src.shared.db.modelos.productos import (
    ImagenProducto,
    MedidaPrenda,
    Prenda3d,
    Producto,
    VarianteProducto,
)
from src.shared.db.modelos.usuarios import DireccionUsuario, Usuario

__all__ = [
    "ArchivoDiseno",
    "AvatarUsuario",
    "Carrito",
    "CarritoDetalle",
    "Categoria",
    "Color",
    "DireccionUsuario",
    "DisenoPersonalizado",
    "Envio",
    "EstadoPedido",
    "EstadoPersonalizacion",
    "HistorialEstadoPedido",
    "HistorialEstadoPersonalizacion",
    "ImagenProducto",
    "MedidaPrenda",
    "MedidaUsuario",
    "Pago",
    "Pedido",
    "PedidoDetalle",
    "PedidoPersonalizado",
    "Prenda3d",
    "Producto",
    "RecomendacionTalla",
    "Rol",
    "SesionProbador",
    "Talla",
    "Usuario",
    "VarianteProducto",
]
