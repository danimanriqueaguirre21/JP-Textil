from src.shared.db.engine import build_engine


def test_build_engine_returns_engine() -> None:
    engine = build_engine()
    assert engine.url.database is not None
