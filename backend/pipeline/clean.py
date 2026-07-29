"""
clean.py
--------
Data cleaning and preprocessing pipeline.

Steps:
  1. Drop exact duplicates
  2. Handle missing values (strategy per column)
  3. Fix data-type issues
  4. Clip / remove statistical outliers via IQR
  5. Normalise categorical strings
  6. Save cleaned Parquet to data/processed/
"""

from pathlib import Path

import numpy as np
import pandas as pd

from pipeline.ingest import NUMERIC_COLS, CATEGORICAL_COLS, run as ingest_run

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = ROOT / "data" / "processed"
CLEAN_PATH = PROCESSED_DIR / "cleaned.parquet"

# ---------------------------------------------------------------------------
# IQR outlier bounds (columns we clip rather than drop)
# ---------------------------------------------------------------------------
IQR_CLIP_COLS = ["Budget", "Clicks", "Revenue_Generated", "ROI", "Units_Sold", "Bundle_Price"]
IQR_MULTIPLIER = 3.0  # generous – synthetic data may have intentional extremes


def drop_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    dropped = before - len(df)
    if dropped:
        print(f"[clean] Dropped {dropped:,} duplicate rows.")
    return df


def fix_types(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure numeric columns are float/int and categoricals are strings."""
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
    # Subscription_Length should be int
    if "Subscription_Length" in df.columns:
        df["Subscription_Length"] = pd.to_numeric(
            df["Subscription_Length"], errors="coerce"
        ).astype("Int64")
    # Customer_Satisfaction_Post_Refund: 1–5 scale, keep as int
    if "Customer_Satisfaction_Post_Refund" in df.columns:
        df["Customer_Satisfaction_Post_Refund"] = pd.to_numeric(
            df["Customer_Satisfaction_Post_Refund"], errors="coerce"
        ).astype("Int64")
    return df


def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    """
    Strategy:
    - Numeric: fill with column median
    - Categorical: fill with 'Unknown'
    """
    missing_before = df.isnull().sum().sum()

    for col in NUMERIC_COLS:
        if col in df.columns and df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"[clean] Filled {col} nulls with median={median_val:.4f}")

    for col in CATEGORICAL_COLS:
        if col in df.columns and df[col].isnull().any():
            df[col] = df[col].fillna("Unknown")

    missing_after = df.isnull().sum().sum()
    print(f"[clean] Nulls: {missing_before:,} → {missing_after:,}")
    return df


def clip_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """Clip extreme values using IQR method (does not remove rows)."""
    for col in IQR_CLIP_COLS:
        if col not in df.columns:
            continue
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - IQR_MULTIPLIER * iqr
        upper = q3 + IQR_MULTIPLIER * iqr
        clipped = ((df[col] < lower) | (df[col] > upper)).sum()
        if clipped:
            df[col] = df[col].clip(lower=lower, upper=upper)
            print(f"[clean] Clipped {clipped:,} outliers in '{col}' [{lower:.2f}, {upper:.2f}]")
    return df


def normalise_categoricals(df: pd.DataFrame) -> pd.DataFrame:
    """Standardise casing for known low-cardinality columns."""
    if "Subscription_Tier" in df.columns:
        df["Subscription_Tier"] = df["Subscription_Tier"].str.strip().str.title()
    if "Common_Keywords" in df.columns:
        df["Common_Keywords"] = df["Common_Keywords"].str.strip().str.title()
    return df


def add_clean_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    Boolean flags useful for downstream quality checks.
    """
    # Flag rows where clicks > 0 but conversions = 0 (pure vanity traffic)
    df["is_zero_conversion"] = (df["Clicks"] > 0) & (df["Conversions"] == 0)
    # Flag negative ROI campaigns
    df["is_negative_roi"] = df["ROI"] < 0
    return df


def run(df: pd.DataFrame | None = None) -> pd.DataFrame:
    """Full cleaning pipeline."""
    if df is None:
        df = ingest_run()

    print("\n[clean] --- Starting Cleaning Pipeline ---")
    df = drop_duplicates(df)
    df = fix_types(df)
    df = handle_missing(df)
    df = clip_outliers(df)
    df = normalise_categoricals(df)
    df = add_clean_flags(df)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_parquet(CLEAN_PATH, index=False)
    print(f"[clean] Saved cleaned data → {CLEAN_PATH}")
    print(f"[clean] Final shape: {df.shape}\n")
    return df


if __name__ == "__main__":
    run()
