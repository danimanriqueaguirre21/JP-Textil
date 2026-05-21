from src.core.logging import configure_logging


def test_configure_logging_debug_on() -> None:
    configure_logging(True)


def test_configure_logging_debug_off() -> None:
    configure_logging(False)
