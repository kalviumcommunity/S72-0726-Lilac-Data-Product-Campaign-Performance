"""
main.py
-------
FastAPI entrypoint for the Campaign Performance Intelligence API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import data_routes

app = FastAPI(
    title="Campaign Performance Intelligence API",
    description="Identify which campaigns drive real activation vs. vanity traffic",
    version="0.1.0",
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React + Vite defaults
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data_routes.router, prefix="/api", tags=["Data & EDA"])


@app.get("/")
def read_root():
    return {
        "message": "Campaign Performance Intelligence API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
