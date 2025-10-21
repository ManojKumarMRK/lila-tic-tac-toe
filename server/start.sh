#!/bin/bash

# Lila Tic-Tac-Toe Server Startup Script

echo "🎮 Starting Lila Tic-Tac-Toe Server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build TypeScript
echo "📦 Building TypeScript..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ TypeScript build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ TypeScript build successful"

# Start the server
echo "🚀 Starting Nakama server with Docker Compose..."
docker-compose up --build

echo "🎯 Server started! Visit http://localhost:7351 for the Nakama console"