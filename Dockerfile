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

RUN npm run build

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
