#!/bin/bash

set -e

echo "🚀 KeyKurs Frontend - Quick Start"
echo "=================================="
echo ""

if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and set your environment variables:"
    echo "   - VITE_API_URL"
    echo "   - VITE_VK_CLIENT_ID"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

source .env

if [ -z "$VITE_API_URL" ]; then
    echo "❌ Error: VITE_API_URL not set in .env file"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔍 Running type check..."
npm run typecheck

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm run preview  - Preview production build"
echo "  npm run lint     - Run linter"
echo ""
echo "API URL: $VITE_API_URL"
echo ""
echo "To start development server, run:"
echo "  npm run dev"
