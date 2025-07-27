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

ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]

# 👇 This is your final CMD in production
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
