# Frontend Deployment Guide

## Quick Start

### Using Docker

1. **Build the image:**
```bash
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  --build-arg VITE_VK_CLIENT_ID=your_vk_client_id \
  -t keykurs-frontend .
```

2. **Run the container:**
```bash
docker run -d \
  -p 80:80 \
  --name keykurs-frontend \
  keykurs-frontend
```

### Using Docker Compose

1. **Create `.env` file:**
```bash
API_URL=https://api.yourdomain.com
VK_CLIENT_ID=your_vk_client_id
```

2. **Start:**
```bash
docker-compose up -d
```

## Production Deployment

### Prerequisites
- Domain name configured
- SSL certificate (Let's Encrypt recommended)
- Backend API running and accessible

### Deployment Options

#### Option 1: Traditional VPS (DigitalOcean, Hetzner, etc.)

1. **Install Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

2. **Clone repository:**
```bash
git clone <your-repo-url> keykurs-frontend
cd keykurs-frontend
```

3. **Configure environment:**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

4. **Build and run:**
```bash
docker build \
  --build-arg VITE_API_URL=$API_URL \
  --build-arg VITE_VK_CLIENT_ID=$VK_CLIENT_ID \
  -t keykurs-frontend .

docker run -d \
  -p 80:80 \
  --restart unless-stopped \
  --name keykurs-frontend \
  keykurs-frontend
```

5. **Setup Nginx reverse proxy (if needed):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Setup SSL with Let's Encrypt:**
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

#### Option 2: Netlify (Static Hosting)

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build locally:**
```bash
VITE_API_URL=https://api.yourdomain.com \
VITE_VK_CLIENT_ID=your_vk_client_id \
npm run build
```

3. **Deploy:**
```bash
netlify deploy --prod --dir=dist
```

4. **Configure redirects** (create `dist/_redirects`):
```
/*    /index.html   200
```

#### Option 3: Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Configure `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_VK_CLIENT_ID": "@vk-client-id"
  }
}
```

3. **Deploy:**
```bash
vercel --prod
```

#### Option 4: AWS S3 + CloudFront

1. **Build:**
```bash
npm run build
```

2. **Upload to S3:**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. **Configure CloudFront:**
- Create distribution pointing to S3 bucket
- Set default root object to `index.html`
- Configure error pages (404 → `/index.html` with 200 status)

#### Option 5: GitHub Pages

Not recommended for this project due to:
- No environment variable support at build time
- HTTPS requirement for OAuth
- Routing complexities

## Environment Variables

Configure these before building:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (e.g., `https://api.example.com`) |
| `VITE_VK_CLIENT_ID` | Yes | VK OAuth application ID |

## Nginx Configuration

### Full Production Config

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for index.html
    location /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    client_max_body_size 10M;
}
```

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: yourusername/keykurs-frontend:latest
          build-args: |
            VITE_API_URL=${{ secrets.API_URL }}
            VITE_VK_CLIENT_ID=${{ secrets.VK_CLIENT_ID }}

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull yourusername/keykurs-frontend:latest
            docker stop keykurs-frontend || true
            docker rm keykurs-frontend || true
            docker run -d \
              -p 80:80 \
              --restart unless-stopped \
              --name keykurs-frontend \
              yourusername/keykurs-frontend:latest
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build
        --build-arg VITE_API_URL=$API_URL
        --build-arg VITE_VK_CLIENT_ID=$VK_CLIENT_ID
        -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
  script:
    - ssh user@server "
        docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA &&
        docker stop keykurs-frontend || true &&
        docker rm keykurs-frontend || true &&
        docker run -d -p 80:80 --name keykurs-frontend $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
      "
```

## Health Checks

Add to `nginx.conf`:

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

Docker health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
```

## Monitoring

### Basic Nginx Logs

```bash
# Access logs
docker exec keykurs-frontend tail -f /var/log/nginx/access.log

# Error logs
docker exec keykurs-frontend tail -f /var/log/nginx/error.log
```

### With Prometheus

Add to `docker-compose.yml`:

```yaml
services:
  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:latest
    ports:
      - "9113:9113"
    command:
      - -nginx.scrape-uri=http://frontend/stub_status
```

## Troubleshooting

### Issue: White screen after deployment

**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly
3. Check CORS settings on backend
4. Ensure all assets loaded (check Network tab)

### Issue: 404 on page refresh

**Solution:**
- Verify nginx `try_files` directive is set correctly
- Check that all routes go through `/index.html`

### Issue: API calls failing

**Solution:**
1. Check `VITE_API_URL` environment variable
2. Verify backend is accessible from browser
3. Check CORS headers on backend
4. Verify SSL certificates if using HTTPS

## Performance Optimization

1. **Enable Brotli compression** (in addition to Gzip)
2. **Use CDN** for static assets
3. **Enable HTTP/2 or HTTP/3**
4. **Configure browser caching headers**
5. **Use lazy loading for routes**
6. **Optimize images** before uploading

## Rollback Procedure

```bash
# Tag current version
docker tag keykurs-frontend keykurs-frontend:backup

# Pull previous version
docker pull keykurs-frontend:previous-tag

# Stop current container
docker stop keykurs-frontend
docker rm keykurs-frontend

# Start previous version
docker run -d -p 80:80 --name keykurs-frontend keykurs-frontend:previous-tag
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables not exposed in client
- [ ] CORS properly configured on backend
- [ ] Content Security Policy (CSP) headers
- [ ] Rate limiting on Nginx
- [ ] DDoS protection (CloudFlare recommended)
- [ ] Regular dependency updates
- [ ] Container security scanning

## Support

For issues:
1. Check logs: `docker logs keykurs-frontend`
2. Check Nginx config: `docker exec keykurs-frontend nginx -t`
3. Verify environment variables
4. Review browser console and network tab
