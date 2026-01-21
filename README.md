# Sexta Medical - Clinical Health Record Application

A comprehensive medical web application for clinic management with Django backend, React frontend, and PostgreSQL database.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.12+ (for local development)
- PostgreSQL (for local development without Docker)

### Setup with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 6MEDICAL
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Set up users:**
   ```bash
   docker-compose run --rm backend python manage.py setup_users
   ```

5. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

### Setup for Local Development

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment variable configuration.

**Backend:**
```bash
cd 6Back
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_users
python manage.py runserver
```

**Frontend:**
```bash
cd 6Front
cp .env.example .env
npm install
npm run dev
```

## 📁 Project Structure

```
6MEDICAL/
├── 6Back/                 # Django backend
│   ├── ClinicalH/         # Main app
│   ├── SextaMedical/     # Django settings
│   ├── manage.py
│   └── requirements.txt
├── 6Front/               # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml     # Docker orchestration
├── .env.example          # Environment variables template
└── README.md
```

## 👥 User Roles

1. **Superuser (willarevalo)**
   - Full CRUD access
   - Can edit all notes and patient information
   - Can delete patients

2. **Read-only User (Colin)**
   - Can view everything
   - Cannot modify anything

3. **Nurse Users**
   - Can create notes
   - Can edit own notes within 48 hours
   - Can create patients (but not delete)
   - Can add/delete medications
   - Cannot edit patient information

## 🔧 Environment Variables

See [ENV_SETUP.md](./ENV_SETUP.md) for complete documentation.

Key variables:
- `SECRET_KEY` - Django secret key (change in production!)
- `POSTGRES_PASSWORD` - Database password
- `DEBUG` - Debug mode (set to False in production)
- `VITE_API_URL` - Frontend API URL

## 🐳 Docker Commands

See [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md) for all available commands.

Quick commands:
```bash
# Run migrations and collect static
./docker-commands.sh migrate-and-collectstatic

# Setup users
./docker-commands.sh setup-users

# Django shell
./docker-commands.sh shell
```

## 📝 Features

- **Patient Management**: Create, view, edit, and manage patient records
- **Medical Notes**: Create and edit clinical notes with traceability
- **Medication Management**: Add, edit, and track medications
- **Role-based Access Control**: Different permissions for different user types
- **Autocomplete**: Smart autocomplete for frequently used medications
- **Responsive Design**: Works on desktop and mobile devices

## 🔒 Security

- JWT authentication
- Role-based permissions
- CORS configuration
- Input validation (frontend and backend)
- SQL injection protection (Django ORM)

## 📚 Documentation

- [Environment Setup](./ENV_SETUP.md) - Environment variables guide
- [Docker Commands](./DOCKER_COMMANDS.md) - Docker command reference

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd 6Back
python manage.py test

# Or use the test runner
python run_all_tests.py
```

### Code Style

- Backend: Follow PEP 8
- Frontend: ESLint configuration included

## 📄 License

[Your License Here]

## 👨‍💻 Contributors

[Your Name/Team]
