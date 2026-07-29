"""
eda.py
------
Exploratory Data Analysis pipeline.

Generates:
  1. Summary statistics JSON  → data/processed/eda_summary.json
  2. Correlation matrix JSON  → data/processed/eda_correlation.json
  3. Distribution stats       → data/processed/eda_distributions.json
  4. Vanity vs activation     → data/processed/eda_vanity_vs_activation.json
  5. Keyword performance      → data/processed/eda_keyword_performance.json
  6. Tier breakdown           → data/processed/eda_tier_breakdown.json

All outputs are JSON so the FastAPI layer can serve them directly to the frontend.
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = ROOT / "data" / "processed"
FEATURES_PATH = PROCESSED_DIR / "features.parquet"


class NpEncoder(json.JSONEncoder):
    """Handle numpy types when serialising to JSON."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def _save(data: dict | list, filename: str) -> Path:
    path = PROCESSED_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, cls=NpEncoder, indent=2)
    print(f"[eda] Saved → {path}")
    return path


def generate_summary(df: pd.DataFrame) -> dict:
    """High-level KPI summary."""
    numeric_cols = [
        "Budget", "Clicks", "Conversions", "Revenue_Generated", "ROI",
        "Units_Sold", "Bundle_Price", "Discount_Level",
        "conversion_rate", "activation_score",
    ]
    existing = [c for c in numeric_cols if c in df.columns]
    desc = df[existing].describe().round(4).to_dict()

    summary = {
        "total_rows": len(df),
        "total_campaigns": df["Campaign_ID"].nunique(),
        "total_revenue": round(float(df["Revenue_Generated"].sum()), 2),
        "avg_roi": round(float(df["ROI"].mean()), 4),
        "avg_conversion_rate": round(float(df["conversion_rate"].mean()), 4),
        "avg_activation_score": round(float(df["activation_score"].mean()), 2),
        "vanity_traffic_count": int(df["vanity_traffic_flag"].sum()),
        "vanity_traffic_pct": round(df["vanity_traffic_flag"].mean() * 100, 2),
        "high_activation_count": int((df["activation_label"] == "High").sum()),
        "numeric_describe": desc,
    }
    _save(summary, "eda_summary.json")
    return summary


def generate_correlation(df: pd.DataFrame) -> dict:
    """Pearson correlation matrix for key numeric features."""
    cols = [
        "Budget", "Clicks", "Conversions", "Revenue_Generated", "ROI",
        "Units_Sold", "Discount_Level", "conversion_rate",
        "activation_score", "subscription_value_score",
    ]
    existing = [c for c in cols if c in df.columns]
    corr = df[existing].corr(numeric_only=True).round(4)
    data = {
        "columns": existing,
        "matrix": corr.values.tolist(),
    }
    _save(data, "eda_correlation.json")
    return data


def generate_distributions(df: pd.DataFrame) -> dict:
    """Histogram bin data for key metrics."""
    cols = ["Budget", "Clicks", "Conversions", "Revenue_Generated", "ROI", "activation_score"]
    result = {}
    for col in cols:
        if col not in df.columns:
            continue
        counts, bin_edges = np.histogram(df[col].dropna(), bins=30)
        result[col] = {
            "counts": counts.tolist(),
            "bin_edges": [round(x, 4) for x in bin_edges.tolist()],
            "mean": round(float(df[col].mean()), 4),
            "median": round(float(df[col].median()), 4),
            "std": round(float(df[col].std()), 4),
        }
    _save(result, "eda_distributions.json")
    return result


def generate_vanity_vs_activation(df: pd.DataFrame) -> dict:
    """
    Clicks vs Conversion Rate scatter data + vanity flag breakdown.
    Returns a sample of 500 points to keep the payload light for the frontend.
    """
    sample = df.sample(min(500, len(df)), random_state=42)
    scatter = sample[[
        "Campaign_ID", "Clicks", "conversion_rate",
        "activation_score", "activation_label", "vanity_traffic_flag", "ROI"
    ]].copy()
    scatter["vanity_traffic_flag"] = scatter["vanity_traffic_flag"].astype(int)

    label_counts = df["activation_label"].value_counts().to_dict()
    vanity_breakdown = df.groupby("vanity_traffic_flag").agg(
        count=("Campaign_ID", "count"),
        avg_roi=("ROI", "mean"),
        avg_conversions=("Conversions", "mean"),
        avg_revenue=("Revenue_Generated", "mean"),
    ).round(4).reset_index().to_dict(orient="records")

    data = {
        "scatter_points": scatter.to_dict(orient="records"),
        "activation_label_counts": label_counts,
        "vanity_breakdown": vanity_breakdown,
    }
    _save(data, "eda_vanity_vs_activation.json")
    return data


def generate_keyword_performance(df: pd.DataFrame) -> dict:
    """Average KPIs grouped by Common_Keywords."""
    grouped = (
        df.groupby("Common_Keywords")
        .agg(
            campaign_count=("Campaign_ID", "count"),
            avg_conversion_rate=("conversion_rate", "mean"),
            avg_roi=("ROI", "mean"),
            avg_revenue=("Revenue_Generated", "mean"),
            avg_activation_score=("activation_score", "mean"),
            total_revenue=("Revenue_Generated", "sum"),
        )
        .round(4)
        .reset_index()
        .sort_values("avg_activation_score", ascending=False)
    )
    data = grouped.to_dict(orient="records")
    _save(data, "eda_keyword_performance.json")
    return data


def generate_tier_breakdown(df: pd.DataFrame) -> dict:
    """KPI breakdown by Subscription_Tier."""
    grouped = (
        df.groupby("Subscription_Tier")
        .agg(
            count=("Customer_ID", "count"),
            avg_conversion_rate=("conversion_rate", "mean"),
            avg_roi=("ROI", "mean"),
            avg_revenue=("Revenue_Generated", "mean"),
            avg_activation_score=("activation_score", "mean"),
            avg_satisfaction=("Customer_Satisfaction_Post_Refund", "mean"),
            avg_subscription_length=("Subscription_Length", "mean"),
        )
        .round(4)
        .reset_index()
        .sort_values("avg_activation_score", ascending=False)
    )
    data = grouped.to_dict(orient="records")
    _save(data, "eda_tier_breakdown.json")
    return data


def run(df: pd.DataFrame | None = None) -> dict:
    """Run all EDA steps and return consolidated results."""
    if df is None:
        if not FEATURES_PATH.exists():
            from pipeline.features import run as features_run
            df = features_run()
        else:
            df = pd.read_parquet(FEATURES_PATH)
            print(f"[eda] Loaded features from {FEATURES_PATH}")

    print("\n[eda] --- Starting EDA ---")
    results = {
        "summary": generate_summary(df),
        "correlation": generate_correlation(df),
        "distributions": generate_distributions(df),
        "vanity_vs_activation": generate_vanity_vs_activation(df),
        "keyword_performance": generate_keyword_performance(df),
        "tier_breakdown": generate_tier_breakdown(df),
    }
    print("[eda] EDA complete.\n")
    return results


if __name__ == "__main__":
    run()
