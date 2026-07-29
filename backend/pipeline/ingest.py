"""
ingest.py
---------
Responsible for loading the raw CSV, validating schema, and copying it into
data/raw/ so downstream steps always work from a known location.
"""

import shutil
from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]
RAW_CSV_SOURCE = ROOT / "marketing_and_product_performance.csv"
RAW_DIR = ROOT / "data" / "raw"
RAW_CSV_DEST = RAW_DIR / "marketing_and_product_performance.csv"

# ---------------------------------------------------------------------------
# Expected schema
# ---------------------------------------------------------------------------
EXPECTED_COLUMNS = [
    "Campaign_ID",
    "Product_ID",
    "Budget",
    "Clicks",
    "Conversions",
    "Revenue_Generated",
    "ROI",
    "Customer_ID",
    "Subscription_Tier",
    "Subscription_Length",
    "Flash_Sale_ID",
    "Discount_Level",
    "Units_Sold",
    "Bundle_ID",
    "Bundle_Price",
    "Customer_Satisfaction_Post_Refund",
    "Common_Keywords",
]

NUMERIC_COLS = [
    "Budget",
    "Clicks",
    "Conversions",
    "Revenue_Generated",
    "ROI",
    "Subscription_Length",
    "Discount_Level",
    "Units_Sold",
    "Bundle_Price",
    "Customer_Satisfaction_Post_Refund",
]

CATEGORICAL_COLS = [
    "Campaign_ID",
    "Product_ID",
    "Customer_ID",
    "Subscription_Tier",
    "Flash_Sale_ID",
    "Bundle_ID",
    "Common_Keywords",
]


def copy_raw_csv() -> Path:
    """Copy the source CSV into data/raw/ if not already there."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if not RAW_CSV_DEST.exists():
        if not RAW_CSV_SOURCE.exists():
            raise FileNotFoundError(
                f"Source CSV not found at: {RAW_CSV_SOURCE}\n"
                "Place marketing_and_product_performance.csv in the project root."
            )
        shutil.copy2(RAW_CSV_SOURCE, RAW_CSV_DEST)
        print(f"[ingest] Copied CSV → {RAW_CSV_DEST}")
    else:
        print(f"[ingest] Raw CSV already present at {RAW_CSV_DEST}")
    return RAW_CSV_DEST


def load_raw(path: Path | None = None) -> pd.DataFrame:
    """Load the raw CSV and return a DataFrame."""
    csv_path = path or RAW_CSV_DEST
    if not csv_path.exists():
        copy_raw_csv()
    df = pd.read_csv(csv_path)
    print(f"[ingest] Loaded {len(df):,} rows × {len(df.columns)} columns")
    return df


def validate_schema(df: pd.DataFrame) -> None:
    """Raise ValueError if required columns are missing."""
    missing = set(EXPECTED_COLUMNS) - set(df.columns)
    if missing:
        raise ValueError(f"[ingest] Missing expected columns: {missing}")

    # Coerce numeric columns
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    print("[ingest] Schema validation passed.")


def get_basic_info(df: pd.DataFrame) -> dict:
    """Return a dict of basic dataset statistics for logging / API use."""
    return {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist(),
        "missing_values": df.isnull().sum().to_dict(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "numeric_summary": df[NUMERIC_COLS].describe().to_dict(),
    }


def run() -> pd.DataFrame:
    """Full ingest step: copy → load → validate → report."""
    copy_raw_csv()
    df = load_raw()
    validate_schema(df)
    info = get_basic_info(df)

    print("\n[ingest] --- Dataset Summary ---")
    print(f"  Rows           : {info['rows']:,}")
    print(f"  Columns        : {info['columns']}")
    total_missing = sum(info["missing_values"].values())
    print(f"  Total nulls    : {total_missing:,}")
    print("[ingest] Ingest complete.\n")
    return df


if __name__ == "__main__":
    run()
