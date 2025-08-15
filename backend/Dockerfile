FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Dependencies useful for health checks and building common packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first for better caching
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project code
COPY . /app

# Folders for static, media, and SQLite storage
RUN mkdir -p /vol/static /vol/media /app/db

# Start via entrypoint
CMD ["/app/entrypoint.sh"]

