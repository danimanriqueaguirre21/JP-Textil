from starlette.testclient import TestClient


def test_predict_size_stub(api_client: TestClient) -> None:
    res = api_client.post(
        "/api/v1/predictions/",
        json={"height_cm": 170, "weight_kg": 70, "fit": "regular"},
    )
    assert res.status_code == 200
    body = res.json()
    assert "size" in body
    assert "confidence" in body
    assert "model_version" in body


def test_predict_slim_and_oversize(api_client: TestClient) -> None:
    slim = api_client.post(
        "/api/v1/predictions/",
        json={"height_cm": 180, "weight_kg": 60, "fit": "slim"},
    )
    over = api_client.post(
        "/api/v1/predictions/",
        json={"height_cm": 160, "weight_kg": 90, "fit": "oversize"},
    )
    assert slim.status_code == 200
    assert over.status_code == 200


def test_predict_validation_error(api_client: TestClient) -> None:
    res = api_client.post("/api/v1/predictions/", json={"height_cm": 10})
    assert res.status_code == 422
    payload = res.json()
    assert payload["error"]["code"] == "validation_error"


def test_predict_invalid_fit(api_client: TestClient) -> None:
    res = api_client.post(
        "/api/v1/predictions/",
        json={"height_cm": 170, "weight_kg": 70, "fit": "invalid"},
    )
    assert res.status_code == 422
