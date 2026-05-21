from unittest.mock import MagicMock, patch

from src.shared.db.session import get_db


def test_get_db_yields_session_and_closes() -> None:
    mock_session = MagicMock()

    with patch("src.shared.db.session.SessionLocal", return_value=mock_session):
        gen = get_db()
        session = next(gen)
        assert session is mock_session
        try:
            gen.send(None)
        except StopIteration:
            pass
        mock_session.close.assert_called_once()
