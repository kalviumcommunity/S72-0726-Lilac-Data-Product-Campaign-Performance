"""
activation_classifier.py - Classifies campaigns into High Activation (1) or Not (0)
"""
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report

ROOT = Path(__file__).resolve().parents[3]
MODELS_DIR = ROOT / "backend" / "models"
PROCESSED_DIR = ROOT / "data" / "processed"

def encode_discount_tier(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    mapping = {"Low": 0, "Medium": 1, "High": 2}
    if "discount_tier" in df.columns:
        df["discount_tier_encoded"] = df["discount_tier"].map(mapping).fillna(0)
    return df

def run(df: pd.DataFrame = None) -> dict:
    if df is None:
        features_path = PROCESSED_DIR / "features.parquet"
        if not features_path.exists():
            raise FileNotFoundError(f"Missing {features_path}. Run pipeline first.")
        df = pd.read_parquet(features_path)
        
    print("\n[activation_classifier] --- Training Activation Classifier ---")
    
    # Preprocess
    df = encode_discount_tier(df)
    
    features = [
        "Budget", "Clicks", "ROI", "Discount_Level", "Units_Sold", "Bundle_Price",
        "Subscription_Length", "Customer_Satisfaction_Post_Refund",
        "subscription_value_score", "discount_tier_encoded",
        "revenue_per_click", "cost_per_conversion"
    ]
    
    # Binarise target: 1 if "High", 0 otherwise
    df["activation_binary"] = (df["activation_label"] == "High").astype(int)
    target = "activation_binary"
    
    X = df[features].fillna(df[features].median())
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Calculate scale_pos_weight
    neg_count = sum(y_train == 0)
    pos_count = sum(y_train == 1)
    scale_weight = neg_count / pos_count if pos_count > 0 else 1
    
    model = XGBClassifier(random_state=42, scale_pos_weight=scale_weight)
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    
    metrics = {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "roc_auc": roc_auc
    }
    
    # Save model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODELS_DIR / "activation_classifier.joblib")
    
    # Feature importances
    importances = dict(zip(features, [float(v) for v in model.feature_importances_]))
    with open(PROCESSED_DIR / "ml_activation_importance.json", "w") as f:
        json.dump(importances, f, indent=2)
        
    # Classification report
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    with open(PROCESSED_DIR / "ml_classification_report.json", "w") as f:
        json.dump(report, f, indent=2)
        
    print(f"[activation_classifier] Metrics: {metrics}")
    return metrics

if __name__ == "__main__":
    run()
