#!/bin/bash
set -e

echo "=========================================="
echo "Starting Django Backend Setup"
echo "=========================================="

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p /app/logs || true
mkdir -p /app/staticfiles || true
mkdir -p /app/media || true

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is up and ready!"
echo "   Host: $POSTGRES_HOST"
echo "   Port: $POSTGRES_PORT"
echo "   Database: $POSTGRES_DB"
echo "   User: $POSTGRES_USER"

# Test database connection
echo ""
echo "Testing database connection..."
python << EOF
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SextaMedical.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)
EOF

# Create migrations if needed (for new models)
echo ""
echo "Creating migrations (if needed)..."
python manage.py makemigrations --noinput --skip-checks || echo "No new migrations to create"

# Run migrations
echo ""
echo "Running database migrations..."
python manage.py migrate --noinput --skip-checks

# Create cache table for django-ratelimit
echo ""
echo "Creating cache table..."
python manage.py createcachetable --skip-checks || echo "Cache table already exists"

# Verify migrations were applied
echo ""
echo "Verifying migrations..."
python manage.py showmigrations --list --skip-checks

# Collect static files
echo ""
echo "Collecting static files..."
mkdir -p /app/staticfiles || true
python manage.py collectstatic --noinput --skip-checks || echo "Static files collection skipped"

# Verify tables exist
echo ""
echo "Verifying database tables..."
python << EOF
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SextaMedical.settings')
django.setup()
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    print(f"✅ Found {len(tables)} tables in database:")
    for table in tables:
        print(f"   - {table[0]}")
    
    # Check for key tables
    table_names = [t[0] for t in tables]
    if 'ClinicalH_patient' in table_names:
        print("✅ Patient table exists!")
    else:
        print("❌ Patient table NOT found!")
    
    if 'auth_user' in table_names:
        print("✅ User table exists!")
    else:
        print("❌ User table NOT found!")
EOF

echo ""
echo "=========================================="
echo "✅ Setup complete! Starting server..."
echo "=========================================="
echo ""

# Execute the main command
exec "$@"
