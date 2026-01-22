#!/bin/bash
# =============================================================================
# Database Restore Script for SEXTA Medical
# =============================================================================
# Restores a SQL backup to the PostgreSQL database
#
# Usage: ./restore_database.sh <backup_file.sql>
# Example: ./restore_database.sh ../backups/sexta_medical_backup_20240119_120000.sql
# =============================================================================

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -z "$1" ]; then
    echo "=============================================="
    echo "  SEXTA Medical - Database Restore"
    echo "=============================================="
    echo ""
    echo "Usage: $0 <backup_file.sql>"
    echo ""
    echo "Available backups:"
    if [ -d "${PROJECT_ROOT}/backups" ]; then
        ls -la "${PROJECT_ROOT}/backups"/*.sql 2>/dev/null || echo "  No backups found"
    else
        echo "  No backups directory found"
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Handle relative paths
if [[ ! "$BACKUP_FILE" = /* ]]; then
    BACKUP_FILE="${PROJECT_ROOT}/${BACKUP_FILE}"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=============================================="
echo "  SEXTA Medical - Database Restore"
echo "=============================================="
echo ""
echo "Backup file: $BACKUP_FILE"
echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
echo "⚠️  WARNING: This will OVERWRITE all existing data!"
echo ""

read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

cd "$PROJECT_ROOT"

# Check if Docker containers are running
if ! docker-compose ps | grep -q "sexta_medical_db.*Up"; then
    echo ""
    echo "Starting database container..."
    docker-compose up -d db
    echo "Waiting for database to be ready..."
    sleep 10
fi

echo ""
echo "Restoring database..."

# Restore using docker-compose exec
docker-compose exec -T db psql -U sexta_user -d sexta_medical_db < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database restored successfully!"
    echo ""
    
    # Verify restoration
    PATIENT_COUNT=$(docker-compose exec -T db psql -U sexta_user -d sexta_medical_db -t -c "SELECT COUNT(*) FROM \"ClinicalH_patient\";" 2>/dev/null | tr -d ' ')
    USER_COUNT=$(docker-compose exec -T db psql -U sexta_user -d sexta_medical_db -t -c "SELECT COUNT(*) FROM auth_user;" 2>/dev/null | tr -d ' ')
    
    echo "📊 Restored data:"
    echo "   - Patients: ${PATIENT_COUNT:-0}"
    echo "   - Users: ${USER_COUNT:-0}"
    echo ""
    
    # Run migrations to ensure schema is up to date
    echo "Running migrations to ensure schema is current..."
    docker-compose exec backend python manage.py migrate --noinput --skip-checks 2>/dev/null || true
    
    echo ""
    echo "✅ Restore complete!"
else
    echo "❌ Restore failed!"
    exit 1
fi
