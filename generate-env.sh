#!/bin/sh
set -e

echo "Generating .env file from environment variables..."

cat > .env << EOF
VITE_API_URL=${VITE_API_URL}
VITE_VK_CLIENT_ID=${VITE_VK_CLIENT_ID}
EOF

echo ".env file created successfully:"
cat .env
