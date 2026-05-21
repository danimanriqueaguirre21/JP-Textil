"""Carga modelo Random Forest y expone inferencia o fallback heurístico."""

from __future__ import annotations

import os
from pathlib import Path

MODEL_PATH = Path(os.environ.get("JOTAPE_RF_MODEL", "")).expanduser()

SIZES = ("XS", "S", "M", "L", "XL")


def _heuristic_size(height_cm: float, weight_kg: float, fit: str) -> tuple[str, float]:
    score = (weight_kg - 50) / 8.5 + ((height_cm - 168) / 16) * 0.4
    if fit == "slim":
        score -= 0.5
    elif fit == "oversize":
        score += 1.0
    idx = int(max(0, min(len(SIZES) - 1, round(score))))
    return SIZES[idx], 0.65


def predict_size_rf_or_stub(
    *,
    height_cm: float,
    weight_kg: float,
    fit: str,
) -> dict[str, str | float]:
    version: str = "stub-v0"
    if MODEL_PATH.is_file():
        try:
            import joblib  # type: ignore[import-untyped]

            pipe = joblib.load(MODEL_PATH)
            X = [
                [
                    height_cm,
                    weight_kg,
                    {"slim": 0, "regular": 1, "oversize": 2}.get(fit, 1),
                ]
            ]
            raw = pipe.predict(X)[0]
            return {
                "size": str(raw),
                "confidence": 0.82,
                "model_version": f"rf-file:{MODEL_PATH.name}",
            }
        except Exception:
            version = "stub-fallback-after-error"

    size, conf = _heuristic_size(height_cm, weight_kg, fit)
    return {"size": size, "confidence": conf, "model_version": version}
