import pytest
from unittest.mock import patch, MagicMock
from app.api import ml_routes

def test_load_models_populates_cache():
    # Reset the cache for the test
    ml_routes.MODELS["conversion"] = None
    ml_routes.MODELS["activation"] = None
    ml_routes.MODELS["revenue"] = None

    fake_model = MagicMock()
    with patch("joblib.load", return_value=fake_model):
        ml_routes.load_models()

    assert ml_routes.MODELS["conversion"] is fake_model
    assert ml_routes.MODELS["activation"] is fake_model
    assert ml_routes.MODELS["revenue"] is fake_model

def test_load_models_idempotent():
    sentinel = object()
    ml_routes.MODELS["conversion"] = sentinel

    with patch("joblib.load") as mock_load:
        ml_routes.load_models()
        # Since 'conversion' is not None, joblib.load should not be called
        mock_load.assert_not_called()

def test_load_models_handles_exceptions(capsys):
    ml_routes.MODELS["conversion"] = None

    with patch("joblib.load", side_effect=Exception("Failed to load")):
        ml_routes.load_models()

    # Check that error was caught and printed, and cache remains None
    captured = capsys.readouterr()
    assert "Error loading models" in captured.out
    assert ml_routes.MODELS["conversion"] is None