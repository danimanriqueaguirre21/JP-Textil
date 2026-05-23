from fastapi import APIRouter, Depends



from src.modules.users.presentation.schemas import UsuarioPublico

from src.shared.auth.deps import get_current_user

from src.shared.db.modelos import Usuario



router = APIRouter(prefix="/users", tags=["users"])





@router.get("/me", response_model=UsuarioPublico)

def me(current_user: Usuario = Depends(get_current_user)):

    return current_user

