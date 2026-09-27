# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Python Backend & Web Server
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend, processed data, and resources
COPY backend/ ./backend/
COPY data/ ./data/
COPY results/ ./results/
COPY scripts/ ./scripts/
COPY run_app.py .

# Copy pre-built frontend distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default port
EXPOSE 8000
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Command to launch production server
CMD ["sh", "-c", "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
