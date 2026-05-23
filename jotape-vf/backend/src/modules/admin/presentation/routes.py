from fastapi import APIRouter, Depends

from src.shared.auth.deps import require_rol
from src.shared.db.modelos import Usuario

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/ping")
def admin_ping(_: Usuario = Depends(require_rol("admin"))):
    """Comprueba RBAC admin (proteger futuras rutas de panel con el mismo patrón)."""
    return {"ok": True}
