FROM node:20-alpine AS builder

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_VK_CLIENT_ID

# Set them as environment variables for the build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_VK_CLIENT_ID=${VITE_VK_CLIENT_ID}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN chmod +x generate-env.sh && ./generate-env.sh

# Debug: Show environment variables before build
RUN echo "=========================================" && \
    echo "Environment check before npm build:" && \
    echo "VITE_API_URL=${VITE_API_URL}" && \
    echo "VITE_VK_CLIENT_ID=${VITE_VK_CLIENT_ID}" && \
    cat .env && \
    echo "========================================="

RUN npm run build

# Debug: Check if env vars are embedded in build
RUN echo "=========================================" && \
    echo "Checking built files for API URL..." && \
    grep -r "api.keykurs.ru" dist/ || echo "WARNING: API URL not found in build!" && \
    grep -r "localhost:3000" dist/ || echo "Good: No localhost references" && \
    echo "========================================="

# Generate version.html with build information
RUN chmod +x generate-version.sh && ./generate-version.sh

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Display build info on container start
RUN echo '#!/bin/sh' > /docker-entrypoint.d/99-show-build-info.sh && \
    echo 'echo "========================================="' >> /docker-entrypoint.d/99-show-build-info.sh && \
    echo 'echo "KeyKurs Frontend Started"' >> /docker-entrypoint.d/99-show-build-info.sh && \
    echo 'echo "Version info available at: /version.html"' >> /docker-entrypoint.d/99-show-build-info.sh && \
    echo 'echo "========================================="' >> /docker-entrypoint.d/99-show-build-info.sh && \
    chmod +x /docker-entrypoint.d/99-show-build-info.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
