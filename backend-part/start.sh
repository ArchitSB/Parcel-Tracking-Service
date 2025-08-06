#!/bin/bash

echo "🚀 Starting Parcel Tracking Service Backend Setup"

# Create logs directory
mkdir -p logs

# Check if .env exists, if not copy from .env.example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration before starting the server"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the server
echo "🚀 Starting the server..."
echo "The API will be available at http://localhost:3000"
echo "Health check: http://localhost:3000/health"
echo ""
echo "To stop the server, press Ctrl+C"
echo ""

npm run dev
