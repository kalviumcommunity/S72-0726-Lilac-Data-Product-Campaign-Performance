# Campaign Performance & Activation Intelligence

A full-stack ML project that identifies which campaigns drive real downstream activation versus vanity traffic.

## Project Structure

```
├── data/
│   ├── raw/                        # Original CSV
│   └── processed/                  # Cleaned + feature-engineered data
├── notebooks/                      # Exploratory analysis notebooks
├── backend/
│   ├── app/
│   │   ├── api/                    # FastAPI route handlers
│   │   ├── ml/                     # ML models + inference
│   │   ├── services/               # Business logic
│   │   └── schemas/                # Pydantic request/response models
│   ├── pipeline/
│   │   ├── ingest.py               # Data loading & validation
│   │   ├── clean.py                # Cleaning & preprocessing
│   │   ├── features.py             # Feature engineering
│   │   └── eda.py                  # EDA + summary stats generation
│   ├── models/                     # Saved model artifacts (.pkl / .joblib)
│   ├── main.py                     # FastAPI entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level pages
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API client
│   │   └── types/                  # TypeScript interfaces
│   ├── package.json
│   └── ...
└── scripts/
    └── run_pipeline.py             # End-to-end pipeline runner
```

## Phases

| Week | Focus |
|------|-------|
| 1 | Data ingestion, cleaning, EDA, activation scoring |
| 2 | ML models: conversion prediction, classifier, clustering |
| 3 | Advanced insights: feature importance, keyword analysis |
| 4 | Frontend dashboard + prediction UI |

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python scripts/run_pipeline.py
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
