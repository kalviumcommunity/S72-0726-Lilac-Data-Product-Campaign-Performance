"""
features.py
-----------
Feature engineering on top of cleaned data.

New features created:
  - conversion_rate          : Conversions / Clicks (core activation signal)
  - revenue_per_click        : Revenue_Generated / Clicks
  - revenue_per_conversion   : Revenue_Generated / Conversions
  - cost_per_click           : Budget / Clicks
  - cost_per_conversion      : Budget / Conversions
  - click_efficiency         : Conversions / Clicks (same as conversion_rate, alias)
  - roi_per_budget_unit      : ROI / Budget (normalised efficiency)
  - activation_score         : Composite weighted score (0-100) — the KEY signal
  - activation_label         : 'High' / 'Medium' / 'Low' based on activation_score
  - discount_tier            : Binned discount level (Low / Medium / High)
  - subscription_value_score : Subscription_Length × tier_weight
"""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = ROOT / "data" / "processed"
CLEAN_PATH = PROCESSED_DIR / "cleaned.parquet"
FEATURES_PATH = PROCESSED_DIR / "features.parquet"

# ---------------------------------------------------------------------------
# Activation score weights (must sum to 1.0)
# ---------------------------------------------------------------------------
ACTIVATION_WEIGHTS = {
    "conversion_rate": 0.35,      # Primary: are clicks turning into action?
    "roi_normalised": 0.30,       # Efficiency of spend
    "revenue_per_click": 0.20,    # Revenue quality per interaction
    "satisfaction_normalised": 0.15,  # Post-purchase signal
}

SUBSCRIPTION_TIER_WEIGHTS = {
    "Premium": 3,
    "Standard": 2,
    "Basic": 1,
    "Unknown": 1,
}


def _safe_divide(numerator: pd.Series, denominator: pd.Series, fill: float = 0.0) -> pd.Series:
    """Division that replaces division-by-zero with `fill`."""
    return numerator.div(denominator.replace(0, np.nan)).fillna(fill)


def add_ratio_features(df: pd.DataFrame) -> pd.DataFrame:
    df["conversion_rate"] = _safe_divide(df["Conversions"], df["Clicks"])
    df["revenue_per_click"] = _safe_divide(df["Revenue_Generated"], df["Clicks"])
    df["revenue_per_conversion"] = _safe_divide(df["Revenue_Generated"], df["Conversions"])
    df["cost_per_click"] = _safe_divide(df["Budget"], df["Clicks"])
    df["cost_per_conversion"] = _safe_divide(df["Budget"], df["Conversions"])
    df["roi_per_budget_unit"] = _safe_divide(df["ROI"], df["Budget"])
    return df


def add_discount_tier(df: pd.DataFrame) -> pd.DataFrame:
    """Bin Discount_Level into Low / Medium / High."""
    bins = [0, 20, 40, 100]
    labels = ["Low", "Medium", "High"]
    df["discount_tier"] = pd.cut(
        df["Discount_Level"],
        bins=bins,
        labels=labels,
        include_lowest=True,
    ).astype(str)
    return df


def add_subscription_value_score(df: pd.DataFrame) -> pd.DataFrame:
    """Subscription_Length × tier weight → proxy for customer lifetime value."""
    tier_weight = df["Subscription_Tier"].map(SUBSCRIPTION_TIER_WEIGHTS).fillna(1)
    df["subscription_value_score"] = df["Subscription_Length"].astype(float) * tier_weight
    return df


def add_activation_score(df: pd.DataFrame) -> pd.DataFrame:
    """
    Composite activation score (0–100).

    Each component is min-max scaled to [0, 1] before weighting,
    so the score is comparable across campaigns.
    """
    scaler = MinMaxScaler()

    components = {
        "conversion_rate": df["conversion_rate"].values.reshape(-1, 1),
        "roi_normalised": df["ROI"].values.reshape(-1, 1),
        "revenue_per_click": df["revenue_per_click"].values.reshape(-1, 1),
        "satisfaction_normalised": df["Customer_Satisfaction_Post_Refund"]
            .astype(float)
            .values.reshape(-1, 1),
    }

    score = np.zeros(len(df))
    for key, values in components.items():
        weight = ACTIVATION_WEIGHTS[key]
        scaled = scaler.fit_transform(values).flatten()
        score += weight * scaled

    df["activation_score"] = np.round(score * 100, 2)

    # Label: top 33% = High, bottom 33% = Low, else Medium
    p33 = df["activation_score"].quantile(0.33)
    p67 = df["activation_score"].quantile(0.67)
    df["activation_label"] = pd.cut(
        df["activation_score"],
        bins=[-np.inf, p33, p67, np.inf],
        labels=["Low", "Medium", "High"],
    ).astype(str)

    print(
        f"[features] Activation score range: "
        f"{df['activation_score'].min():.2f} – {df['activation_score'].max():.2f} "
        f"| mean={df['activation_score'].mean():.2f}"
    )
    return df


def add_vanity_flag(df: pd.DataFrame) -> pd.DataFrame:
    """
    vanity_traffic_flag = 1 when:
      - Clicks are in the top 40% for the dataset AND
      - conversion_rate is below the 25th percentile
    This isolates campaigns with impressive reach but poor activation.
    """
    click_threshold = df["Clicks"].quantile(0.60)
    conv_threshold = df["conversion_rate"].quantile(0.25)
    df["vanity_traffic_flag"] = (
        (df["Clicks"] >= click_threshold) & (df["conversion_rate"] <= conv_threshold)
    ).astype(int)
    vanity_count = df["vanity_traffic_flag"].sum()
    print(f"[features] Vanity traffic campaigns detected: {vanity_count:,}")
    return df


def run(df: pd.DataFrame | None = None) -> pd.DataFrame:
    """Full feature engineering pipeline."""
    if df is None:
        if not CLEAN_PATH.exists():
            from pipeline.clean import run as clean_run
            df = clean_run()
        else:
            df = pd.read_parquet(CLEAN_PATH)
            print(f"[features] Loaded cleaned data from {CLEAN_PATH}")

    print("\n[features] --- Starting Feature Engineering ---")
    df = add_ratio_features(df)
    df = add_discount_tier(df)
    df = add_subscription_value_score(df)
    df = add_activation_score(df)
    df = add_vanity_flag(df)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_parquet(FEATURES_PATH, index=False)
    print(f"[features] Saved feature-engineered data → {FEATURES_PATH}")
    print(f"[features] Final shape: {df.shape} | New columns: {df.shape[1] - 17}\n")
    return df


if __name__ == "__main__":
    run()
