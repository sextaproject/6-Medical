#!/bin/bash

# Quick PostgreSQL Setup Script for M1 Mac
# This script helps you set up PostgreSQL for the Clinical Health app

echo "=========================================="
echo "PostgreSQL Setup for Sexta Medical"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Installing PostgreSQL..."
    brew install postgresql@15
    brew services start postgresql@15
    echo "✅ PostgreSQL installed and started"
else
    echo "✅ PostgreSQL is already installed"
fi

# Check if PostgreSQL is running
if brew services list | grep -q "postgresql.*started"; then
    echo "✅ PostgreSQL service is running"
else
    echo "⚠️  Starting PostgreSQL service..."
    brew services start postgresql@15
fi

echo ""
echo "Creating database and user..."
echo ""

# Create database and user (you'll need to enter password for postgres user)
psql postgres << EOF
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE sexta_medical_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sexta_medical_db')\gexec

-- Create user if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'sexta_user') THEN
        CREATE USER sexta_user WITH PASSWORD 'Ars0.1.2.1';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sexta_medical_db TO sexta_user;
\c sexta_medical_db
GRANT ALL ON SCHEMA public TO sexta_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sexta_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sexta_user;
\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully"
else
    echo "❌ Error creating database. Please run manually:"
    echo "   psql postgres"
    echo "   Then run the SQL commands from DATABASE_SETUP_INSTRUCTIONS.md"
    exit 1
fi

echo ""
echo "Creating .env file..."

# Create .env file
cat > .env << EOL
SECRET_KEY=django-insecure-change-this-in-production-$(openssl rand -hex 32)
DEBUG=True
POSTGRES_DB=sexta_medical_db
POSTGRES_USER=sexta_user
POSTGRES_PASSWORD=Ars0.1.2.1
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
EOL

if [ -f .env ]; then
    echo "✅ .env file created"
else
    echo "❌ Error creating .env file"
    exit 1
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Install Python dependencies:"
echo "   pip install psycopg[binary]"
echo ""
echo "2. Run migrations:"
echo "   python manage.py migrate"
echo ""
echo "3. Create users:"
echo "   python manage.py setup_users"
echo ""
echo "4. Verify connection:"
echo "   python manage.py dbshell"
echo ""
echo "After this, all new patients will be saved to PostgreSQL!"
echo ""
