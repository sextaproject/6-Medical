# Quick Start - Docker Setup

## 🚀 Quick Start Commands

### 1. Start Everything
```bash
cd /Users/willarevalo/Documents/VIRTUAL_SEXTA/6MEDICAL
docker-compose up --build
```

### 2. Set Up Users (in another terminal)
```bash
docker-compose exec backend python manage.py setup_users
```

### 3. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## 📝 How to Add Patients

### Option 1: Through the Web App (Easiest)
1. Go to http://localhost
2. Login (use `willarevalo` or `Nurse` credentials)
3. Click **"Nuevo paciente"** button
4. Fill out the form
5. Click **"Registrar Paciente"**
6. ✅ Patient is saved to PostgreSQL automatically!

### Option 2: Through Django Admin
1. Go to http://localhost:8000/admin
2. Login with superuser (`willarevalo`)
3. Navigate to **ClinicalH → Patients**
4. Click **"Add Patient"**
5. Fill form and save
6. ✅ Saved to PostgreSQL!

## 💾 Where Are Patients Saved?

**✅ YES - Patients are saved to PostgreSQL Database**

- Database: `sexta_medical_db`
- Table: `ClinicalH_patient`
- Data persists even after stopping containers
- Stored in Docker volume: `postgres_data`

## 🔧 Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose stop

# Remove everything (WARNING: deletes data!)
docker-compose down -v

# Run migrations
docker-compose exec backend python manage.py migrate

# Create users
docker-compose exec backend python manage.py setup_users

# Access database
docker-compose exec db psql -U sexta_user -d sexta_medical_db
```

## 📚 Full Documentation

See `DOCKER_SETUP_GUIDE.md` for complete documentation.
