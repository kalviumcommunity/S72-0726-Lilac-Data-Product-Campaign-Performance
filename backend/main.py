"""
main.py - FastAPI entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import data_routes, ml_routes

app = FastAPI(
    title="Campaign Performance Intelligence API",
    description="Identify which campaigns drive real activation vs. vanity traffic",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_routes.router, prefix="/api", tags=["Data & EDA"])
app.include_router(ml_routes.router, prefix="/api", tags=["ML Models"])

@app.get("/")
def read_root():
    return {"message": "Campaign Performance Intelligence API", "status": "running", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
