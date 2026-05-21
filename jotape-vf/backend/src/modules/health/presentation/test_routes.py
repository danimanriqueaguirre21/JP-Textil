from starlette.testclient import TestClient


def test_health_returns_ok(api_client: TestClient) -> None:
    res = api_client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
