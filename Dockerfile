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
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# ⬇️ Inject env vars from Railway into a .env file at build time
RUN echo "DATABASE_URL=${DATABASE_URL}" > .env

# Collect static files (needs DATABASE_URL set)
RUN python manage.py collectstatic --noinput

# Entrypoint
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
