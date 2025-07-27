# docker/Dockerfile

FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    dos2unix \
    git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY docker/entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]

# TEMPORARY: create superuser
CMD ["python", "scripts/make_migrations.py"]

