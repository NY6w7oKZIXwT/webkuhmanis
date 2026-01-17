#!/bin/bash

# Quick Start Script for Payment OTP System

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  🔐 Payment OTP System - Quick Start      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not installed${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found (psql)${NC}"
    echo "   You'll need PostgreSQL running on localhost:5432"
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# 2. Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# 3. Setup backend .env
echo -e "${YELLOW}⚙️  Setting up environment...${NC}"

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  Edit backend/.env with your database credentials:"
    echo "   - DB_HOST=localhost"
    echo "   - DB_PORT=5432"
    echo "   - DB_NAME=webkuhmanis"
    echo "   - DB_USER=postgres"
    echo "   - DB_PASSWORD=postgres"
    echo ""
    read -p "Press Enter after editing (or continue with defaults)..."
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# 4. Database migration
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run migrate -w backend 2>/dev/null || {
    echo -e "${RED}❌ Migration failed${NC}"
    echo "   Make sure PostgreSQL is running:"
    echo "   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres"
    exit 1
}
echo -e "${GREEN}✓ Database ready${NC}"
echo ""

# 5. Ready to start
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 Demo Accounts:"
echo "   User:  email: user@test.com, password: test123"
echo "   Admin: password: admin123"
echo ""
echo "🐳 Or use Docker:"
echo "   docker-compose up"
echo ""
echo "📖 More info:"
echo "   - README.md for feature overview"
echo "   - DEPLOYMENT.md for production setup"
echo ""
