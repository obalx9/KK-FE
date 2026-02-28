#!/bin/sh
set -e

echo "==================================="
echo "Generating .env file from environment variables..."
echo "==================================="
echo "Current environment variables:"
echo "VITE_API_URL=${VITE_API_URL:-NOT SET}"
echo "VITE_VK_CLIENT_ID=${VITE_VK_CLIENT_ID:-NOT SET}"
echo "==================================="

if [ -z "$VITE_API_URL" ]; then
    echo "WARNING: VITE_API_URL is not set! Using default value."
    VITE_API_URL="https://api.keykurs.ru"
fi

if [ -z "$VITE_VK_CLIENT_ID" ]; then
    echo "WARNING: VITE_VK_CLIENT_ID is not set! Using default value."
    VITE_VK_CLIENT_ID="54463778"
fi

cat > .env << EOF
VITE_API_URL=${VITE_API_URL}
VITE_VK_CLIENT_ID=${VITE_VK_CLIENT_ID}
EOF

echo "==================================="
echo ".env file created successfully:"
cat .env
echo "==================================="
