#!/bin/bash

# Load environment variables from .env.local
if [ -f "../.env.local" ]; then
    export $(cat ../.env.local | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env.local"
    echo "   MONGODB_URI: ${MONGODB_URI:0:30}..."
    echo "   JWT_SECRET: ${JWT_SECRET:0:10}..."
else
    echo "❌ .env.local not found"
    exit 1
fi

# Run Spring Boot application
./gradlew bootRun
