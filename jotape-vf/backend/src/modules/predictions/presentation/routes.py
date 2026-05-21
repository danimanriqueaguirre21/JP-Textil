from fastapi import APIRouter

from src.ml.predictor import predict_size_rf_or_stub
from src.modules.predictions.presentation.schemas import (
    PredictionRequest,
    PredictionResponse,
)

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])


@router.post("/", response_model=PredictionResponse)
async def predict_size(payload: PredictionRequest) -> PredictionResponse:
    data = predict_size_rf_or_stub(
        height_cm=payload.height_cm,
        weight_kg=payload.weight_kg,
        fit=payload.fit,
    )
    return PredictionResponse(**data)
