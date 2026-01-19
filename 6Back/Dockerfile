# Django Backend Dockerfile
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files (for production)
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Wait for PostgreSQL\n\
echo "Waiting for PostgreSQL..."\n\
while ! pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER > /dev/null 2>&1; do\n\
  echo "PostgreSQL is unavailable - sleeping"\n\
  sleep 1\n\
done\n\
echo "PostgreSQL is up - executing command"\n\
\n\
# Run migrations\n\
python manage.py migrate --noinput\n\
\n\
# Create superuser if it doesn\'t exist (optional)\n\
# python manage.py setup_users || true\n\
\n\
# Execute command\n\
exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Run Django development server (override in docker-compose for production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
