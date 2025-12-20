#!/bin/bash
set -e

echo "Setting up imageSICS..."

# 1. Setup Core
echo "Installing imagesics-core..."
cd packages/imagesics-core
pip install -e .
cd ../..

# 2. Setup API
echo "Installing imagesics-api..."
cd apps/api
pip install -e .
cd ../..

# 3. Setup Web
echo "Setting up Web Frontend..."
cd apps/web
# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

echo "Setup complete!"
echo "To run backend: uvicorn imagesics_api.main:app --app-dir apps/api/src --reload --port 8000"
echo "To run frontend: cd apps/web && npm run dev"
