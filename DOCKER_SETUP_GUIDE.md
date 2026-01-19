# Docker Setup Guide - Sexta Medical Application

## Overview

This guide explains how to run the Sexta Medical application using Docker and Docker Compose. The application consists of:
- **PostgreSQL Database** - Stores all patient data, users, notes, medications
- **Django Backend** - REST API server
- **React Frontend** - User interface

## Prerequisites

- Docker Desktop installed (or Docker Engine + Docker Compose)
- Git (to clone the repository)

## Quick Start

### 1. Clone and Navigate to Project

```bash
cd /path/to/6MEDICAL
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your settings (optional for local development, required for production).

### 3. Build and Start Containers

```bash
docker-compose up --build
```

This will:
- Build all Docker images
- Start PostgreSQL database
- Run database migrations
- Start Django backend on port 8000
- Start React frontend on port 80

### 4. Access the Application

- **Frontend**: http://localhost (or http://localhost:80)
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

### 5. Set Up Initial Users

After containers are running, execute:

```bash
docker-compose exec backend python manage.py setup_users
```

This creates:
- `willarevalo` (superuser)
- `Colin` (password: `Esperanza2026`) - read-only
- `Nurse` (password: `nurse`) - nurse role

## How Patients Are Saved

### ✅ **YES - Patients are saved to PostgreSQL Database**

When you create a new patient through the application:

1. **Frontend (React)**: User fills out the patient form and clicks "Registrar Paciente"
2. **API Call**: Frontend sends POST request to `/api/patients/`
3. **Backend (Django)**: Validates data and saves to PostgreSQL
4. **Database**: Patient record is stored in `ClinicalH_patient` table in PostgreSQL

### Ways to Add Patients:

#### 1. **Through the Web Application (Recommended)**
- Login to the app (http://localhost)
- Click "Nuevo paciente" button
- Fill out the form
- Click "Registrar Paciente"
- Patient is saved to PostgreSQL automatically

#### 2. **Through Django Admin**
- Go to http://localhost:8000/admin
- Login with superuser credentials
- Navigate to "ClinicalH" → "Patients"
- Click "Add Patient"
- Fill out the form and save

#### 3. **Through API (Programmatic)**
```bash
# Get authentication token first
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"willarevalo","password":"your_password"}'

# Use the access token to create a patient
curl -X POST http://localhost:8000/api/patients/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "edad": 45,
    "genero": "Masculino",
    "eps": "Sura",
    "nombre_acudiente": "María Pérez",
    "telefono_acudiente": "3001234567"
  }'
```

#### 4. **Through Django Shell**
```bash
docker-compose exec backend python manage.py shell
```

Then in Python shell:
```python
from ClinicalH.models import Patient
from django.utils import timezone

patient = Patient.objects.create(
    nombre="Juan Pérez",
    edad=45,
    genero="Masculino",
    eps="Sura",
    nombre_acudiente="María Pérez",
    telefono_acudiente="3001234567",
    status="Estable"
)
print(f"Patient created: {patient.id}")
```

### Database Persistence

**Important**: Patient data persists in the PostgreSQL volume (`postgres_data`). Even if you stop containers, data remains. To completely remove data:

```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: This deletes all data!)
docker-compose down -v
```

## Docker Commands Reference

### Start Services
```bash
docker-compose up              # Start in foreground
docker-compose up -d           # Start in background (detached)
docker-compose up --build      # Rebuild images before starting
```

### Stop Services
```bash
docker-compose stop            # Stop containers (keeps data)
docker-compose down            # Stop and remove containers (keeps data)
docker-compose down -v         # Stop and remove everything including volumes (DELETES DATA!)
```

### View Logs
```bash
docker-compose logs            # All services
docker-compose logs backend     # Backend only
docker-compose logs frontend   # Frontend only
docker-compose logs -f         # Follow logs (live)
```

### Execute Commands in Containers
```bash
# Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py setup_users

# Django shell
docker-compose exec backend python manage.py shell

# PostgreSQL shell
docker-compose exec db psql -U sexta_user -d sexta_medical_db

# Check database
docker-compose exec db psql -U sexta_user -d sexta_medical_db -c "SELECT COUNT(*) FROM ClinicalH_patient;"
```

### Rebuild After Code Changes
```bash
# Backend changes
docker-compose up --build backend

# Frontend changes
docker-compose up --build frontend

# Both
docker-compose up --build
```

## Database Backup and Restore

### Backup Database
```bash
docker-compose exec db pg_dump -U sexta_user sexta_medical_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
# Copy backup file into container
docker cp backup_20240101_120000.sql sexta_medical_db:/tmp/backup.sql

# Restore
docker-compose exec db psql -U sexta_user -d sexta_medical_db < /tmp/backup.sql
```

Or directly:
```bash
cat backup_20240101_120000.sql | docker-compose exec -T db psql -U sexta_user -d sexta_medical_db
```

## Production Deployment

### Environment Variables for Production

Create `.env` file with:
```bash
SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=False
POSTGRES_PASSWORD=strong-password-here
REACT_APP_API_URL=https://yourdomain.com/api
```

### Update CORS Settings

In `6Back/SextaMedical/settings.py`, update:
```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

### Run in Production Mode

```bash
# Build for production
docker-compose -f docker-compose.yml build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Create users
docker-compose exec backend python manage.py setup_users
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps db

# Check PostgreSQL logs
docker-compose logs db

# Test connection
docker-compose exec backend python manage.py dbshell
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Check if migrations are needed
docker-compose exec backend python manage.py showmigrations

# Run migrations manually
docker-compose exec backend python manage.py migrate
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

### Port Already in Use
If ports 80 or 8000 are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "8080:8000"  # Backend on 8080 instead of 8000
  - "3000:80"    # Frontend on 3000 instead of 80
```

## Architecture

```
┌─────────────────┐
│   React App     │  Port 80
│   (Frontend)    │
└────────┬────────┘
         │ HTTP Requests
         │
┌────────▼────────┐
│  Django API    │  Port 8000
│   (Backend)     │
└────────┬────────┘
         │ SQL Queries
         │
┌────────▼────────┐
│   PostgreSQL    │  Port 5432
│   (Database)    │
└─────────────────┘
```

## Summary

- ✅ **Patients ARE saved to PostgreSQL** when created through the app
- ✅ **Data persists** in Docker volumes even after stopping containers
- ✅ **Multiple ways** to add patients: Web UI, Django Admin, API, or Django shell
- ✅ **Production-ready** Docker setup with proper networking and volumes
