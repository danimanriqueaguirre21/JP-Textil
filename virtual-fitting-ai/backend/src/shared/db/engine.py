from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from src.core.config import settings


def build_engine() -> Engine:
    return create_engine(
        settings.database_url,
        pool_pre_ping=True,
        future=True,
    )


engine = build_engine()

