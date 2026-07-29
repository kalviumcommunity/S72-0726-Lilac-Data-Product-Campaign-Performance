"""
ingest.py - Load and validate raw CSV data
"""
import shutil
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW_CSV_SOURCE = ROOT / "marketing_and_product_performance.csv"
RAW_DIR = ROOT / "data" / "raw"
RAW_CSV_DEST = RAW_DIR / "marketing_and_product_performance.csv"

EXPECTED_COLUMNS = [
    "Campaign_ID", "Product_ID", "Budget", "Clicks", "Conversions",
    "Revenue_Generated", "ROI", "Customer_ID", "Subscription_Tier",
    "Subscription_Length", "Flash_Sale_ID", "Discount_Level", "Units_Sold",
    "Bundle_ID", "Bundle_Price", "Customer_Satisfaction_Post_Refund",
    "Common_Keywords",
]

NUMERIC_COLS = [
    "Budget", "Clicks", "Conversions", "Revenue_Generated", "ROI",
    "Subscription_Length", "Discount_Level", "Units_Sold", "Bundle_Price",
    "Customer_Satisfaction_Post_Refund",
]

CATEGORICAL_COLS = [
    "Campaign_ID", "Product_ID", "Customer_ID", "Subscription_Tier",
    "Flash_Sale_ID", "Bundle_ID", "Common_Keywords",
]

def copy_raw_csv() -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if not RAW_CSV_DEST.exists():
        if not RAW_CSV_SOURCE.exists():
            raise FileNotFoundError(f"Source CSV not found at: {RAW_CSV_SOURCE}")
        shutil.copy2(RAW_CSV_SOURCE, RAW_CSV_DEST)
        print(f"[ingest] Copied CSV → {RAW_CSV_DEST}")
    else:
        print(f"[ingest] Raw CSV already present at {RAW_CSV_DEST}")
    return RAW_CSV_DEST

def load_raw(path: Path | None = None) -> pd.DataFrame:
    csv_path = path or RAW_CSV_DEST
    if not csv_path.exists():
        copy_raw_csv()
    df = pd.read_csv(csv_path)
    print(f"[ingest] Loaded {len(df):,} rows × {len(df.columns)} columns")
    return df

def validate_schema(df: pd.DataFrame) -> None:
    missing = set(EXPECTED_COLUMNS) - set(df.columns)
    if missing:
        raise ValueError(f"[ingest] Missing expected columns: {missing}")
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    print("[ingest] Schema validation passed.")

def run() -> pd.DataFrame:
    copy_raw_csv()
    df = load_raw()
    validate_schema(df)
    print(f"\n[ingest] --- Dataset Summary ---")
    print(f"  Rows: {len(df):,}, Columns: {len(df.columns)}")
    print(f"  Total nulls: {df.isnull().sum().sum():,}")
    print("[ingest] Ingest complete.\n")
    return df

if __name__ == "__main__":
    run()
