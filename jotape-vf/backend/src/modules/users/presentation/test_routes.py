import pytest

pytestmark = pytest.mark.postgres


def test_me_rejects_invalid_token(api_client_db) -> None:
    res = api_client_db.get(
        "/users/me",
        headers={"Authorization": "Bearer not-a-real-jwt"},
    )
    assert res.status_code == 401
