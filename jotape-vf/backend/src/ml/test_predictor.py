from pathlib import Path
from unittest.mock import MagicMock, patch

import joblib
import pytest

from src.ml import predictor as predictor_mod
from src.ml.predictor import SIZES, predict_size_rf_or_stub


def test_heuristic_regular() -> None:
    out = predict_size_rf_or_stub(height_cm=175, weight_kg=72, fit="regular")
    assert out["size"] in SIZES
    assert 0 <= float(out["confidence"]) <= 1
    assert "model_version" in out


def test_heuristic_slim_and_oversize() -> None:
    slim = predict_size_rf_or_stub(height_cm=170, weight_kg=70, fit="slim")
    over = predict_size_rf_or_stub(height_cm=170, weight_kg=70, fit="oversize")
    assert slim["size"] in SIZES
    assert over["size"] in SIZES


def test_heuristic_unknown_fit_uses_regular_mapping() -> None:
    out = predict_size_rf_or_stub(height_cm=170, weight_kg=70, fit="unknown")
    assert out["size"] in SIZES


def test_rf_model_load_success(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    model_path = tmp_path / "model.joblib"
    model_path.write_bytes(b"fake")

    fake_pipe = MagicMock()
    fake_pipe.predict.return_value = ["XL"]

    monkeypatch.setenv("JOTAPE_RF_MODEL", str(model_path))
    monkeypatch.setattr(predictor_mod, "MODEL_PATH", Path(str(model_path)))

    with patch.object(joblib, "load", return_value=fake_pipe):
        out = predict_size_rf_or_stub(height_cm=170, weight_kg=70, fit="regular")
    assert out["size"] == "XL"
    assert out["confidence"] == 0.82
    assert "rf-file" in str(out["model_version"])


def test_rf_model_load_failure_falls_back(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    model_path = tmp_path / "bad.joblib"
    model_path.write_bytes(b"x")
    monkeypatch.setenv("JOTAPE_RF_MODEL", str(model_path))
    monkeypatch.setattr(predictor_mod, "MODEL_PATH", Path(str(model_path)))

    with patch.object(joblib, "load", side_effect=RuntimeError("bad model")):
        out = predict_size_rf_or_stub(height_cm=170, weight_kg=70, fit="regular")
    assert out["size"] in SIZES
    assert out["model_version"] == "stub-fallback-after-error"
