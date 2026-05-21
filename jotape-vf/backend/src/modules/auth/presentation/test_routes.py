import pytest
from sqlalchemy import select, update

from src.modules.users.infrastructure.models import UserModel

pytestmark = pytest.mark.postgres


def test_register_and_login(api_client_db, db_session) -> None:
    reg = api_client_db.post(
        "/auth/register",
        json={
            "email": "buyer@example.com",
            "password": "strong-password-1",
            "full_name": "Buyer",
        },
    )
    assert reg.status_code == 200
    assert reg.json()["email"] == "buyer@example.com"

    login = api_client_db.post(
        "/auth/login",
        json={"email": "buyer@example.com", "password": "strong-password-1"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    assert token

    me = api_client_db.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "buyer@example.com"


def test_register_conflict(api_client_db) -> None:
    payload = {
        "email": "dup@example.com",
        "password": "strong-password-1",
        "full_name": "A",
    }
    assert api_client_db.post("/auth/register", json=payload).status_code == 200
    dup = api_client_db.post("/auth/register", json=payload)
    assert dup.status_code == 409


def test_login_unknown_user(api_client_db) -> None:
    res = api_client_db.post(
        "/auth/login",
        json={"email": "ghost@example.com", "password": "x"},
    )
    assert res.status_code == 401


def test_login_wrong_password(api_client_db) -> None:
    api_client_db.post(
        "/auth/register",
        json={
            "email": "seller@example.com",
            "password": "correct-horse",
            "full_name": "Seller",
        },
    )
    res = api_client_db.post(
        "/auth/login",
        json={"email": "seller@example.com", "password": "wrong"},
    )
    assert res.status_code == 401


def test_login_disabled_user(api_client_db, db_session) -> None:
    api_client_db.post(
        "/auth/register",
        json={
            "email": "inactive@example.com",
            "password": "strong-password-1",
            "full_name": "Inactive",
        },
    )
    user = db_session.execute(
        select(UserModel).where(UserModel.email == "inactive@example.com")
    ).scalar_one()
    db_session.execute(update(UserModel).where(UserModel.id == user.id).values(is_active=False))
    db_session.commit()

    res = api_client_db.post(
        "/auth/login",
        json={"email": "inactive@example.com", "password": "strong-password-1"},
    )
    assert res.status_code == 401
