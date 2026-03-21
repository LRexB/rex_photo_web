#!/bin/bash

# Quick Start Script for Rex Photo Web
# Run this to get up and running in 60 seconds!

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "🚀 Rex Photo Web - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "Download: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm detected: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "   This may take a minute..."
    npm install --quiet
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎨 Starting development server..."
echo "   Server will open in your default browser"
echo "   Press Ctrl+C to stop the server"
echo ""
echo "💡 Tips:"
echo "   - Add photo galleries to: public/photos/YYYY_MM_DD_JobName/"
echo "   - See GALLERY_STRUCTURE.md for naming conventions"
echo "   - Edit colors in: src/index.css"
echo "   - Build for production: npm run build"
echo ""

# Start the development server
npm run dev
