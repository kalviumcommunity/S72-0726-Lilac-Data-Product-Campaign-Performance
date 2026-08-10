FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for building python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the entire app
COPY . /app/

# Run the data pipeline to generate models and processed data
RUN python scripts/run_pipeline.py

# Set the working directory for uvicorn
WORKDIR /app/backend

# Expose the API port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]