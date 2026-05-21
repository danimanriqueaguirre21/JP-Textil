from src.core.config import Settings


def test_settings_database_url_contains_postgresql() -> None:
    s = Settings()
    assert s.database_url.startswith("postgresql+psycopg://")


def test_settings_jwt_defaults() -> None:
    s = Settings()
    assert s.JWT_ALGORITHM == "HS256"
    assert len(s.JWT_SECRET_KEY) > 0
