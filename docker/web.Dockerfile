FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    dos2unix \
    git && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and prepare entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# ❌ REMOVE collectstatic from build step (fails without env vars)
# RUN python manage.py collectstatic --noinput

# Default entrypoint
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
