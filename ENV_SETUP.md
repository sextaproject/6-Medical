# Environment Variables Setup Guide

This guide explains how to configure environment variables for the Sexta Medical application.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **For local development without Docker, also copy backend and frontend .env files:**
   ```bash
   cp 6Back/.env.example 6Back/.env
   cp 6Front/.env.example 6Front/.env
   ```

## Environment Variables

### Root `.env` (for Docker Compose)

Used by `docker-compose.yml` to configure all services.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_DB` | PostgreSQL database name | `sexta_medical_db` | No |
| `POSTGRES_USER` | PostgreSQL username | `sexta_user` | No |
| `POSTGRES_PASSWORD` | PostgreSQL password | `Ars0.1.2.1` | **Yes** (change in production) |
| `POSTGRES_HOST` | Database host (use `db` in Docker) | `db` | No |
| `POSTGRES_PORT` | Database port | `5432` | No |
| `SECRET_KEY` | Django secret key | `django-insecure-change-in-production` | **Yes** (change in production) |
| `DEBUG` | Django debug mode | `True` | No |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173,...` | No |
| `REACT_APP_API_URL` | Frontend API URL | `http://localhost:8000/api` | No |
| `VITE_API_URL` | Frontend API URL (Vite) | `http://localhost:8000/api` | No |

### Backend `.env` (6Back/.env)

Used for local development without Docker.

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `sexta_medical_db` |
| `POSTGRES_USER` | Database user | `sexta_user` |
| `POSTGRES_PASSWORD` | Database password | `Ars0.1.2.1` |
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `SECRET_KEY` | Django secret key | (see default in settings.py) |
| `DEBUG` | Debug mode | `True` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `http://localhost:5173,...` |

### Frontend `.env` (6Front/.env)

Used for local development without Docker.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |

## Production Setup

### 1. Generate a Secure Secret Key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. Update `.env` for Production

```env
# Security
SECRET_KEY=your-generated-secret-key-here
DEBUG=False

# Database (use strong password)
POSTGRES_PASSWORD=your-strong-password-here

# CORS (only your domain)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API URL (your production domain)
REACT_APP_API_URL=https://yourdomain.com/api
VITE_API_URL=https://yourdomain.com/api
```

### 3. Docker Compose

Docker Compose automatically loads variables from `.env` file in the root directory.

```bash
# Start services with .env variables
docker-compose up -d
```

## Local Development (Without Docker)

### Backend Setup

1. Copy backend `.env`:
   ```bash
   cp 6Back/.env.example 6Back/.env
   ```

2. Update `6Back/.env` with your local PostgreSQL settings

3. Install dependencies:
   ```bash
   cd 6Back
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Copy frontend `.env`:
   ```bash
   cp 6Front/.env.example 6Front/.env
   ```

2. Update `6Front/.env` with your backend URL:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. Install dependencies:
   ```bash
   cd 6Front
   npm install
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env` files** - They are in `.gitignore`
2. **Change default passwords** in production
3. **Generate a new SECRET_KEY** for production
4. **Set DEBUG=False** in production
5. **Use HTTPS** in production and update CORS origins accordingly

## Troubleshooting

### Variables not loading?

- **Docker**: Ensure `.env` file is in the root directory
- **Backend**: Check that `python-dotenv` is installed (`pip install python-dotenv`)
- **Frontend**: Ensure variables are prefixed with `VITE_` for Vite to load them

### CORS errors?

- Check `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Ensure no trailing slashes in URLs
- Restart backend after changing CORS settings

### Database connection issues?

- Verify `POSTGRES_HOST` is correct (`db` for Docker, `localhost` for local)
- Check PostgreSQL is running
- Verify credentials match your database setup
