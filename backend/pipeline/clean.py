"""
clean.py - Data cleaning and preprocessing
"""
from pathlib import Path
import numpy as np
import pandas as pd
from pipeline.ingest import NUMERIC_COLS, CATEGORICAL_COLS, run as ingest_run

ROOT = Path(__file__).resolve().parents[2]
PROCESSED_DIR = ROOT / "data" / "processed"
CLEAN_PATH = PROCESSED_DIR / "cleaned.parquet"

IQR_CLIP_COLS = ["Budget", "Clicks", "Revenue_Generated", "ROI", "Units_Sold", "Bundle_Price"]
IQR_MULTIPLIER = 3.0

def drop_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    dropped = before - len(df)
    if dropped:
        print(f"[clean] Dropped {dropped:,} duplicate rows.")
    return df

def fix_types(df: pd.DataFrame) -> pd.DataFrame:
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
    if "Subscription_Length" in df.columns:
        df["Subscription_Length"] = pd.to_numeric(df["Subscription_Length"], errors="coerce").astype("Int64")
    if "Customer_Satisfaction_Post_Refund" in df.columns:
        df["Customer_Satisfaction_Post_Refund"] = pd.to_numeric(
            df["Customer_Satisfaction_Post_Refund"], errors="coerce"
        ).astype("Int64")
    return df

def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    missing_before = df.isnull().sum().sum()
    for col in NUMERIC_COLS:
        if col in df.columns and df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
    for col in CATEGORICAL_COLS:
        if col in df.columns and df[col].isnull().any():
            df[col] = df[col].fillna("Unknown")
    missing_after = df.isnull().sum().sum()
    print(f"[clean] Nulls: {missing_before:,} → {missing_after:,}")
    return df

def clip_outliers(df: pd.DataFrame) -> pd.DataFrame:
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
            print(f"[clean] Clipped {clipped:,} outliers in '{col}'")
    return df

def normalise_categoricals(df: pd.DataFrame) -> pd.DataFrame:
    if "Subscription_Tier" in df.columns:
        df["Subscription_Tier"] = df["Subscription_Tier"].str.strip().str.title()
    if "Common_Keywords" in df.columns:
        df["Common_Keywords"] = df["Common_Keywords"].str.strip().str.title()
    return df

def add_clean_flags(df: pd.DataFrame) -> pd.DataFrame:
    df["is_zero_conversion"] = (df["Clicks"] > 0) & (df["Conversions"] == 0)
    df["is_negative_roi"] = df["ROI"] < 0
    return df

def run(df: pd.DataFrame | None = None) -> pd.DataFrame:
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
