"""
run_pipeline.py - End-to-end Week 1 pipeline execution
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from pipeline import ingest, clean, features, eda

def main():
    print("=" * 70)
    print(" WEEK 1: DATA PIPELINE & EDA ".center(70))
    print("=" * 70)
    
    df_raw = ingest.run()
    df_clean = clean.run(df_raw)
    df_features = features.run(df_clean)
    eda_results = eda.run(df_features)
    
    print("\n" + "=" * 70)
    print(" PIPELINE COMPLETE ".center(70))
    print("=" * 70)
    print(f"\nProcessed files saved to: {ROOT / 'data' / 'processed'}")
    print("\nSummary KPIs:")
    summary = eda_results["summary"]
    print(f"  Total campaigns        : {summary['total_campaigns']:,}")
    print(f"  Total revenue          : ${summary['total_revenue']:,.2f}")
    print(f"  Avg ROI                : {summary['avg_roi']:.4f}")
    print(f"  Avg conversion rate    : {summary['avg_conversion_rate']:.4%}")
    print(f"  Avg activation score   : {summary['avg_activation_score']:.2f}")
    print(f"  Vanity traffic count   : {summary['vanity_traffic_count']:,} ({summary['vanity_traffic_pct']:.2f}%)")
    print(f"  High activation count  : {summary['high_activation_count']:,}")
    print("\nNext: Start the FastAPI server with 'uvicorn backend.main:app --reload'\n")

if __name__ == "__main__":
    main()
