from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
import pytest

from app.api import ml_routes
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_eda_summary_missing_file():
    # If the file doesn't exist, we should expect a 404
    with patch("app.api.data_routes.Path.exists", return_value=False):
        response = client.get("/api/eda/summary")
        assert response.status_code == 404

def test_eda_summary_with_mock_file(tmp_path, monkeypatch):
    import app.api.data_routes as dr
    fake_data = {"test": "data"}
    p = tmp_path / "eda_summary.json"
    p.write_text(json.dumps(fake_data))

    monkeypatch.setattr(dr, "PROCESSED_DIR", tmp_path)
    response = client.get("/api/eda/summary")
    assert response.status_code == 200
    assert response.json() == fake_data

def test_predict_missing_models_returns_500():
    payload = {
        "Budget": 1000,
        "Clicks": 500,
        "ROI": 1.5,
        "Discount_Level": 10,
        "Units_Sold": 100,
        "Bundle_Price": 50,
        "Subscription_Length": 12,
        "Customer_Satisfaction_Post_Refund": 5,
        "subscription_value_score": 30,
        "discount_tier": "Low",
        "revenue_per_click": 2.5,
        "cost_per_conversion": 15,
        "Conversions": 50,
        "activation_score": 80
    }

    # Mock models mapping to simulate unloaded state and force exception
    with patch.dict(ml_routes.MODELS, {"conversion": None, "activation": None, "revenue": None}), \
         patch("app.api.ml_routes.load_models", return_value=None):
        response = client.post("/api/ml/predict", json=payload)
        assert response.status_code == 500
        assert "Models not loaded" in response.json()["detail"]

def test_predict_success():
    payload = {
        "Budget": 1000,
        "Clicks": 500,
        "ROI": 1.5,
        "Discount_Level": 10,
        "Units_Sold": 100,
        "Bundle_Price": 50,
        "Subscription_Length": 12,
        "Customer_Satisfaction_Post_Refund": 5,
        "subscription_value_score": 30,
        "discount_tier": "Low",
        "revenue_per_click": 2.5,
        "cost_per_conversion": 15,
        "Conversions": 50,
        "activation_score": 80
    }

    mock_conversion = MagicMock()
    mock_conversion.predict.return_value = [0.85]

    mock_activation = MagicMock()
    mock_activation.predict_proba.return_value = [[0.2, 0.8]]

    mock_revenue = MagicMock()
    mock_revenue.predict.return_value = [55000.0]

    with patch.dict(ml_routes.MODELS, {
        "conversion": mock_conversion,
        "activation": mock_activation,
        "revenue": mock_revenue
    }), patch("app.api.ml_routes.load_models"):
        response = client.post("/api/ml/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["predicted_conversion_rate"] == 0.85
        assert data["activation_probability"] == 0.8
        assert data["predicted_revenue"] == 55000.0