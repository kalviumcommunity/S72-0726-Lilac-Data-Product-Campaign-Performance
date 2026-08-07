"""
revenue_forecaster.py - Predicts revenue generated using XGBoost Regressor
"""
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

ROOT = Path(__file__).resolve().parents[3]
MODELS_DIR = ROOT / "backend" / "models"
PROCESSED_DIR = ROOT / "data" / "processed"

def run(df: pd.DataFrame = None) -> dict:
    if df is None:
        features_path = PROCESSED_DIR / "features.parquet"
        if not features_path.exists():
            raise FileNotFoundError(f"Missing {features_path}. Run pipeline first.")
        df = pd.read_parquet(features_path)
        
    print("\n[revenue_forecaster] --- Training Revenue Forecaster ---")
    
    features = [
        "Budget", "Clicks", "Conversions", "ROI", "Discount_Level", 
        "Units_Sold", "Bundle_Price", "conversion_rate", "activation_score"
    ]
    target = "Revenue_Generated"
    
    X = df[features].fillna(df[features].median())
    y = df[target].fillna(0)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    model = XGBRegressor(random_state=42)
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))
    
    metrics = {"RMSE": rmse, "MAE": mae, "R2": r2}
    
    # Save model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODELS_DIR / "revenue_forecaster.joblib")
    
    # Feature importances
    importances = dict(zip(features, [float(v) for v in model.feature_importances_]))
    with open(PROCESSED_DIR / "ml_revenue_importance.json", "w") as f:
        json.dump(importances, f, indent=2)
        
    # Test predictions
    campaign_ids = df.loc[X_test.index, "Campaign_ID"] if "Campaign_ID" in df.columns else X_test.index
    
    predictions = []
    for cid, actual, pred in zip(campaign_ids, y_test, y_pred):
        predictions.append({
            "Campaign_ID": cid if isinstance(cid, str) else str(cid),
            "actual": float(actual),
            "predicted": float(pred)
        })
        
    with open(PROCESSED_DIR / "ml_revenue_predictions.json", "w") as f:
        json.dump(predictions, f, indent=2)
        
    with open(PROCESSED_DIR / "ml_revenue_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"[revenue_forecaster] Metrics: {metrics}")
    return metrics

if __name__ == "__main__":
    run()
