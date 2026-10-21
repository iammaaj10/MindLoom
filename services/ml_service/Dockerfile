FROM python:3.10-slim

WORKDIR /app

# Prevent python from writing pyc files and limit multi-thread memory allocations
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

# Install dependencies (CPU-only PyTorch build configured in requirements.txt)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose common deployment ports
EXPOSE 7860 8000 10000

# Support dynamic PORT from Render ($PORT) and fallback to 7860 (Hugging Face) or 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
