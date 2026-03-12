# Stage 1: Build the React Frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build the frontend
RUN npm run build


# Stage 2: Build the FastAPI Backend
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for some python packages (e.g. sentence-transformers, pdfplumber)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set working directory to backend so uvicorn runs correctly
WORKDIR /app/backend

# Create necessary directories
RUN mkdir -p ../uploads ../vector_db

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
