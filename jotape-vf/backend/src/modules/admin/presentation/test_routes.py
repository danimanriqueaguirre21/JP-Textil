import pytest

from src.shared.db.modelos import Usuario

pytestmark = pytest.mark.postgres


def test_admin_ping_requires_admin(api_client_db, db_session) -> None:
    from src.modules.auth.infrastructure.security import hash_password
    from src.shared.db.semillas import obtener_rol_por_codigo

    rol = obtener_rol_por_codigo(db_session, "cliente")
    user = Usuario(
        email="cliente-rbac@example.com",
        contrasena_hash=hash_password("strong-password-1"),
        nombre_completo="Cliente",
        rol_id=rol.id,
        activo=True,
    )
    db_session.add(user)
    db_session.commit()

    login = api_client_db.post(
        "/auth/login",
        json={"email": "cliente-rbac@example.com", "contrasena": "strong-password-1"},
    )
    token = login.json()["access_token"]
    res = api_client_db.get("/admin/ping", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


def test_admin_ping_ok_for_admin(api_client_db, db_session) -> None:
    from src.modules.auth.infrastructure.security import hash_password
    from src.shared.db.semillas import obtener_rol_por_codigo

    rol = obtener_rol_por_codigo(db_session, "admin")
    user = Usuario(
        email="admin-rbac@example.com",
        contrasena_hash=hash_password("strong-password-1"),
        nombre_completo="Admin",
        rol_id=rol.id,
        activo=True,
    )
    db_session.add(user)
    db_session.commit()

    login = api_client_db.post(
        "/auth/login",
        json={"email": "admin-rbac@example.com", "contrasena": "strong-password-1"},
    )
    token = login.json()["access_token"]
    res = api_client_db.get("/admin/ping", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["ok"] is True
