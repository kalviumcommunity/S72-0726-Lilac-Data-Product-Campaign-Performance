"""
run_pipeline.py - End-to-end Week 1 pipeline execution
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from pipeline import ingest, clean, features, eda
from app.ml import conversion_predictor, activation_classifier, customer_segmentation, revenue_forecaster

def main():
    print("=" * 70)
    print(" WEEK 1: DATA PIPELINE & EDA ".center(70))
    print("=" * 70)
    
    df_raw = ingest.run()
    df_clean = clean.run(df_raw)
    df_features = features.run(df_clean)
    eda_results = eda.run(df_features)
    
    print("\n" + "=" * 70)
    print(" WEEK 2: ML MODELS ".center(70))
    print("=" * 70)
    
    # Reload df_features if it was modified (e.g. by segmentation) or pass it along.
    # It's better to pass df_features to each. segmentation modifies and saves it.
    conv_metrics = conversion_predictor.run(df_features)
    act_metrics = activation_classifier.run(df_features)
    seg_results = customer_segmentation.run(df_features)
    rev_metrics = revenue_forecaster.run(df_features)
    
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
    
    print("\nML Metrics:")
    print(f"  Conversion RMSE        : {conv_metrics['RMSE']:.4f}")
    print(f"  Conversion R2          : {conv_metrics['R2']:.4f}")
    print(f"  Activation Accuracy    : {act_metrics['accuracy']:.4f}")
    print(f"  Activation F1          : {act_metrics['f1']:.4f}")
    print(f"  Activation ROC-AUC     : {act_metrics['roc_auc']:.4f}")
    print(f"  Segments formed        : {len(seg_results['profiles'])}")
    print(f"  Revenue RMSE           : {rev_metrics['RMSE']:,.2f}")
    print(f"  Revenue R2             : {rev_metrics['R2']:.4f}")
    
    print("\nNext: Start the FastAPI server with 'uvicorn main:app --reload' in backend dir\n")

if __name__ == "__main__":
    main()
