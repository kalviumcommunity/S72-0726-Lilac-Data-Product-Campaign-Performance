"""
data_routes.py
--------------
API endpoints for serving EDA results and raw/processed data.
"""

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
import pandas as pd

router = APIRouter()

ROOT = Path(__file__).resolve().parents[3]
PROCESSED_DIR = ROOT / "data" / "processed"


def _load_json(filename: str) -> Any:
    path = PROCESSED_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"{filename} not found. Run pipeline first.")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/eda/summary")
def get_eda_summary():
    """High-level KPI summary."""
    return _load_json("eda_summary.json")


@router.get("/eda/correlation")
def get_correlation():
    """Correlation matrix."""
    return _load_json("eda_correlation.json")


@router.get("/eda/distributions")
def get_distributions():
    """Distribution histograms for key metrics."""
    return _load_json("eda_distributions.json")


@router.get("/eda/vanity-vs-activation")
def get_vanity_vs_activation():
    """Vanity traffic vs activation scatter + breakdown."""
    return _load_json("eda_vanity_vs_activation.json")


@router.get("/eda/keyword-performance")
def get_keyword_performance():
    """Performance grouped by keyword theme."""
    return _load_json("eda_keyword_performance.json")


@router.get("/eda/tier-breakdown")
def get_tier_breakdown():
    """KPI breakdown by subscription tier."""
    return _load_json("eda_tier_breakdown.json")


@router.get("/data/features")
def get_features(limit: int = 100, offset: int = 0):
    """Get paginated feature-engineered data."""
    path = PROCESSED_DIR / "features.parquet"
    if not path.exists():
        raise HTTPException(status_code=404, detail="features.parquet not found. Run pipeline first.")
    df = pd.read_parquet(path)
    total = len(df)
    subset = df.iloc[offset : offset + limit]
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": subset.to_dict(orient="records"),
    }
