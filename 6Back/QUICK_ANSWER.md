# Quick Answer: Where Are Patients Saved?

## Current Status

**Right now, your app is using SQLite** (local file: `db.sqlite3`)

This means:
- ✅ New patients ARE being saved
- ❌ But they're saved to SQLite, NOT PostgreSQL
- 📍 Location: `6Back/db.sqlite3`

## To Switch to PostgreSQL

### Quick Setup (Automated)

Run this script:
```bash
cd 6Back
./QUICK_POSTGRES_SETUP.sh
```

Then:
```bash
pip install psycopg[binary]
python manage.py migrate
python manage.py setup_users
```

### Manual Setup

1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create database:**
   ```bash
   psql postgres
   ```
   Then run:
   ```sql
   CREATE DATABASE sexta_medical_db;
   CREATE USER sexta_user WITH PASSWORD 'Ars0.1.2.1';
   GRANT ALL PRIVILEGES ON DATABASE sexta_medical_db TO sexta_user;
   \c sexta_medical_db
   GRANT ALL ON SCHEMA public TO sexta_user;
   \q
   ```

3. **Create `.env` file** in `6Back/`:
   ```bash
   POSTGRES_DB=sexta_medical_db
   POSTGRES_USER=sexta_user
   POSTGRES_PASSWORD=Ars0.1.2.1
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   python manage.py setup_users
   ```

## How to Enter New Patients

### Option 1: Through Web App (Easiest)

1. Login to the app
2. Click **"Nuevo paciente"** button (green button on main menu)
3. Fill in the form:
   - Nombre completo (required)
   - Edad (required)
   - Género (required)
   - EPS (required)
   - Other fields (optional)
4. Click **"Registrar Paciente"**

✅ Patient will be saved to whatever database is configured!

### Option 2: Django Admin

1. Go to: `http://localhost:8000/admin/`
2. Login with superuser (willarevalo)
3. Click "Patients" → "Add Patient"
4. Fill form and save

## Verify Which Database You're Using

```bash
cd 6Back
python manage.py dbshell
```

- If you see `sqlite>` → Using SQLite
- If you see `sexta_medical_db=>` → Using PostgreSQL ✅

## Summary

| Question | Answer |
|----------|--------|
| **Are new patients saved?** | ✅ Yes, they are saved |
| **Where are they saved now?** | SQLite (`db.sqlite3`) |
| **Will they be saved to PostgreSQL?** | ✅ Yes, AFTER you set up PostgreSQL and create `.env` file |
| **How to enter new patients?** | Use "Nuevo paciente" button in the web app |
| **How to switch to PostgreSQL?** | Run `./QUICK_POSTGRES_SETUP.sh` or follow manual steps above |

## Important Notes

- **SQLite is fine for development** - it's a local file database
- **PostgreSQL is recommended for production** - better for multiple users, backups, etc.
- **Once `.env` file exists with `POSTGRES_DB`**, Django will automatically use PostgreSQL
- **All existing data in SQLite can be migrated** to PostgreSQL if needed (see `DATABASE_SETUP_INSTRUCTIONS.md`)
