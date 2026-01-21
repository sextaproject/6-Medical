#!/bin/bash
# Development Setup Script
# This script helps set up the development environment

set -e

echo "=========================================="
echo "Sexta Medical - Development Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Check if backend .env exists
if [ ! -f 6Back/.env ]; then
    echo -e "${YELLOW}Creating 6Back/.env file...${NC}"
    cp 6Back/.env.example 6Back/.env 2>/dev/null || echo "# Backend environment variables" > 6Back/.env
    echo -e "${GREEN}✓ Created 6Back/.env file${NC}"
else
    echo -e "${GREEN}✓ 6Back/.env file already exists${NC}"
fi

# Check if frontend .env exists
if [ ! -f 6Front/.env ]; then
    echo -e "${YELLOW}Creating 6Front/.env file...${NC}"
    cp 6Front/.env.example 6Front/.env 2>/dev/null || echo "# Frontend environment variables" > 6Front/.env
    echo -e "${GREEN}✓ Created 6Front/.env file${NC}"
else
    echo -e "${GREEN}✓ 6Front/.env file already exists${NC}"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env files with your configuration"
echo "2. For Docker: docker-compose up -d"
echo "3. For local dev: See ENV_SETUP.md"
echo ""
echo "Documentation:"
echo "- ENV_SETUP.md - Environment variables guide"
echo "- README.md - Project overview"
echo "- DOCKER_COMMANDS.md - Docker command reference"
echo ""
