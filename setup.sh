#!/bin/bash

# Setup script for Payment OTP System

echo "🚀 Setting up Payment OTP System..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
  echo "⚙️ Creating backend/.env..."
  cp backend/.env.example backend/.env
  echo "Please edit backend/.env with your database credentials"
fi

# Run migrations
echo "🗄️ Running database migrations..."
npm run migrate -w backend

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To deploy with Docker:"
echo "  docker-compose up"
