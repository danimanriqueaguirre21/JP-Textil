from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    height_cm: float = Field(gt=50, le=250)
    weight_kg: float = Field(gt=20, le=200)
    fit: str = Field(default="regular", pattern="^(slim|regular|oversize)$")


class PredictionResponse(BaseModel):
    size: str
    confidence: float = Field(ge=0, le=1)
    model_version: str
