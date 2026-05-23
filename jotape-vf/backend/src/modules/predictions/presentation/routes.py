from fastapi import APIRouter, Request

from src.core.config import settings
from src.core.rate_limit import limiter
from src.ml.predictor import predict_size_rf_or_stub
from src.modules.predictions.presentation.schemas import (
    PredictionRequest,
    PredictionResponse,
)

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])


@router.post("/", response_model=PredictionResponse)
@limiter.limit(settings.RATE_LIMIT_PREDICTIONS)
async def predict_size(request: Request, payload: PredictionRequest) -> PredictionResponse:
    del request
    data = predict_size_rf_or_stub(
        height_cm=payload.height_cm,
        weight_kg=payload.weight_kg,
        fit=payload.fit,
    )
    return PredictionResponse(**data)
