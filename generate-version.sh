#!/bin/sh
set -e

# Ensure dist directory exists
mkdir -p dist

BUILD_TIME=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
API_URL="${VITE_API_URL:-NOT SET}"
VK_ID="${VITE_VK_CLIENT_ID:-NOT SET}"

# Check if we can get node/npm versions
NODE_VER=$(node --version 2>/dev/null || echo "N/A")
NPM_VER=$(npm --version 2>/dev/null || echo "N/A")

cat > dist/version.html << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KeyKurs Build Info</title>
    <style>
        body {
            font-family: 'Monaco', 'Courier New', monospace;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #00ff00;
            padding: 40px 20px;
            margin: 0;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #00ff00;
            border-bottom: 3px solid #00ff00;
            padding-bottom: 15px;
            margin-bottom: 30px;
            text-shadow: 0 0 10px #00ff00;
        }
        .status {
            background: #003300;
            color: #00ff00;
            padding: 10px 20px;
            border-radius: 5px;
            border: 2px solid #00ff00;
            display: inline-block;
            margin-bottom: 20px;
            font-weight: bold;
        }
        pre {
            background: #000;
            padding: 25px;
            border: 2px solid #00ff00;
            border-radius: 8px;
            overflow-x: auto;
            line-height: 1.6;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        .key {
            color: #00cc00;
        }
        .value {
            color: #00ff00;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 KeyKurs Frontend - Build Information</h1>
        <div class="status">✓ Build Successful</div>
        <pre><span class="key">Build Time:</span>    <span class="value">${BUILD_TIME}</span>
<span class="key">API URL:</span>       <span class="value">${API_URL}</span>
<span class="key">VK Client ID:</span>  <span class="value">${VK_ID}</span>
<span class="key">Node Version:</span>  <span class="value">${NODE_VER}</span>
<span class="key">NPM Version:</span>   <span class="value">${NPM_VER}</span></pre>
    </div>
</body>
</html>
EOF

echo "========================================="
echo "version.html generated successfully!"
echo "Location: dist/version.html"
echo "Size: $(wc -c < dist/version.html) bytes"
echo "========================================="
