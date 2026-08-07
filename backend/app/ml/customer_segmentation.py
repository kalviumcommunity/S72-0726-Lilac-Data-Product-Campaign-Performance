"""
customer_segmentation.py - Segments customers using KMeans clustering
"""
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[3]
MODELS_DIR = ROOT / "backend" / "models"
PROCESSED_DIR = ROOT / "data" / "processed"

def run(df: pd.DataFrame = None) -> dict:
    if df is None:
        features_path = PROCESSED_DIR / "features.parquet"
        if not features_path.exists():
            raise FileNotFoundError(f"Missing {features_path}. Run pipeline first.")
        df = pd.read_parquet(features_path)
        
    print("\n[customer_segmentation] --- Training Customer Segmentation ---")
    
    features = [
        "subscription_value_score", "conversion_rate", "ROI", 
        "Customer_Satisfaction_Post_Refund", "Discount_Level", "activation_score"
    ]
    
    X = df[features].fillna(df[features].median())
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    # Calculate means to label clusters
    temp_df = X.copy()
    temp_df["cluster"] = clusters
    
    # Compute per-cluster means
    cluster_means = temp_df.groupby("cluster").mean()
    
    # Sort clusters by activation_score to assign labels
    sorted_clusters = cluster_means.sort_values("activation_score").index.tolist()
    # lowest -> At Risk, middle -> Growth Potential, highest -> High Value
    labels = {
        sorted_clusters[0]: "At Risk",
        sorted_clusters[1]: "Growth Potential",
        sorted_clusters[2]: "High Value"
    }
    
    # Map labels to array
    cluster_labels_array = [labels[c] for c in clusters]
    df["customer_segment"] = cluster_labels_array
    
    # Save back to features.parquet
    df.to_parquet(PROCESSED_DIR / "features.parquet", index=False)
    
    # Build cluster profiles
    profiles = []
    # Also we want to include sizes
    sizes = temp_df["cluster"].value_counts().to_dict()
    
    for c in range(3):
        profile = {
            "cluster_id": int(c),
            "label": labels[c],
            "size": int(sizes[c]),
            "means": {k: float(v) for k, v in cluster_means.loc[c].items()}
        }
        profiles.append(profile)
        
    with open(PROCESSED_DIR / "ml_cluster_profiles.json", "w") as f:
        json.dump(profiles, f, indent=2)
        
    # Save models
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, MODELS_DIR / "cluster_scaler.joblib")
    joblib.dump(kmeans, MODELS_DIR / "customer_segmentation.joblib")
    
    print(f"[customer_segmentation] Clusters formed: {sizes}")
    return {"profiles": profiles}

if __name__ == "__main__":
    run()
