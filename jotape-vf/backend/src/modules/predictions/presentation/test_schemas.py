import pytest
from pydantic import ValidationError

from src.modules.predictions.presentation.schemas import PredictionRequest, PredictionResponse


def test_prediction_request_defaults() -> None:
    req = PredictionRequest(height_cm=170, weight_kg=70)
    assert req.fit == "regular"


def test_prediction_request_invalid_fit() -> None:
    with pytest.raises(ValidationError):
        PredictionRequest(height_cm=170, weight_kg=70, fit="wide")


def test_prediction_response_model() -> None:
    res = PredictionResponse(size="M", confidence=0.7, model_version="stub-v0")
    assert res.model_dump()["size"] == "M"
