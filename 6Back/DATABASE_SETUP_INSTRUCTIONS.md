# Database Setup Instructions

## Current Status

Your Django app is configured to use:
- **PostgreSQL** if `POSTGRES_DB` environment variable is set
- **SQLite** (default) if `POSTGRES_DB` is not set

## How to Check Which Database You're Using

Run this command in your terminal:
```bash
cd 6Back
python manage.py dbshell
```

- If it connects to PostgreSQL → You're using PostgreSQL ✅
- If it shows SQLite prompt → You're using SQLite (local file)

## Setting Up PostgreSQL (M1 Mac)

### Step 1: Install PostgreSQL

```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15
```

### Step 2: Create Database and User

```bash
# Connect to PostgreSQL
psql postgres
```

Then run these SQL commands:
```sql
-- Create database
CREATE DATABASE sexta_medical_db;

-- Create user
CREATE USER sexta_user WITH PASSWORD 'Ars0.1.2.1';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sexta_medical_db TO sexta_user;

-- Connect to the database
\c sexta_medical_db

-- Grant schema privileges (important!)
GRANT ALL ON SCHEMA public TO sexta_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sexta_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sexta_user;

-- Exit
\q
```

### Step 3: Create .env File

Create a `.env` file in the `6Back/` directory:

```bash
cd 6Back
nano .env
```

Add these lines:
```bash
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
POSTGRES_DB=sexta_medical_db
POSTGRES_USER=sexta_user
POSTGRES_PASSWORD=Ars0.1.2.1
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

**Important**: The `.env` file is already in `.gitignore`, so it won't be committed to Git.

### Step 4: Install Python Dependencies

```bash
pip install psycopg[binary]
# Or if using requirements.txt:
pip install -r requirements.txt
```

### Step 5: Run Migrations

```bash
# Create migrations (if models changed)
python manage.py makemigrations

# Apply migrations to PostgreSQL
python manage.py migrate

# Create users
python manage.py setup_users
```

### Step 6: Verify Connection

```bash
python manage.py dbshell
```

You should see the PostgreSQL prompt. Try:
```sql
\dt  -- List tables
SELECT * FROM auth_user;  -- See users
\q  -- Exit
```

## Migrating from SQLite to PostgreSQL

If you have existing data in SQLite and want to migrate to PostgreSQL:

### Option 1: Fresh Start (Recommended for Development)

1. Set up PostgreSQL (steps above)
2. Run migrations: `python manage.py migrate`
3. Create users: `python manage.py setup_users`
4. Add patients through the app UI

### Option 2: Migrate Existing Data

1. **Export data from SQLite:**
```bash
# Make sure you're using SQLite
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > backup.json
```

2. **Set up PostgreSQL** (steps above)

3. **Run migrations on PostgreSQL:**
```bash
python manage.py migrate
```

4. **Load data into PostgreSQL:**
```bash
python manage.py loaddata backup.json
```

5. **Create users:**
```bash
python manage.py setup_users
```

## How to Enter New Patients

### Through the Web App (Recommended)

1. **Login** to the app with your credentials
2. **Click "Nuevo paciente"** button on the main menu
3. **Fill in the form:**
   - Nombre completo (required)
   - Edad (required)
   - Género (required)
   - EPS (required)
   - Other fields (optional)
4. **Click "Registrar Paciente"**

The patient will be saved to whatever database is configured (PostgreSQL if `.env` is set up, SQLite otherwise).

### Through Django Admin

1. **Access admin panel:** `http://localhost:8000/admin/`
2. **Login** with superuser credentials
3. **Click "Patients" → "Add Patient"**
4. **Fill in the form and save**

### Through API (for developers)

```bash
curl -X POST http://localhost:8000/api/patients/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "edad": 45,
    "genero": "Masculino",
    "eps": "Sura",
    "nombre_acudiente": "María Pérez",
    "telefono_acudiente": "1234567890"
  }'
```

## Verifying Where Data is Stored

### Check Current Database

```bash
cd 6Back
python manage.py shell
```

Then in Python shell:
```python
from django.conf import settings
print(settings.DATABASES['default']['ENGINE'])
# Should show: django.db.backends.postgresql (if PostgreSQL)
# Or: django.db.backends.sqlite3 (if SQLite)
```

### Check PostgreSQL Database

```bash
psql -U sexta_user -d sexta_medical_db
```

Then:
```sql
-- List all tables
\dt

-- Count patients
SELECT COUNT(*) FROM "ClinicalH_patient";

-- See patients
SELECT id, nombre, edad, room FROM "ClinicalH_patient";

-- Exit
\q
```

### Check SQLite Database (if using)

```bash
cd 6Back
sqlite3 db.sqlite3
```

Then:
```sql
.tables
SELECT COUNT(*) FROM ClinicalH_patient;
SELECT id, nombre, edad, room FROM ClinicalH_patient;
.quit
```

## Troubleshooting

### "No module named 'psycopg'"
```bash
pip install psycopg[binary]
```

### "FATAL: password authentication failed"
- Check your `.env` file has correct `POSTGRES_PASSWORD`
- Verify PostgreSQL user exists: `psql postgres` then `\du`

### "relation does not exist"
- Run migrations: `python manage.py migrate`

### "permission denied for schema public"
- Run the GRANT commands in Step 2 above

## Summary

✅ **To use PostgreSQL:**
1. Install PostgreSQL
2. Create database and user
3. Create `.env` file with `POSTGRES_DB=sexta_medical_db`
4. Run `python manage.py migrate`
5. Run `python manage.py setup_users`

✅ **To enter new patients:**
- Use the web app UI (click "Nuevo paciente" button)
- Or use Django admin panel
- Patients are automatically saved to the configured database

✅ **Current database:**
- Check with `python manage.py dbshell`
- Or check if `.env` file exists with `POSTGRES_DB` set
