FROM node:20-alpine AS builder

# Add build dependencies for better performance
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable pnpm before any operations
RUN corepack enable pnpm

# Cache dependencies
COPY package.json pnpm-lock.yaml ./

# Cache build tools separately
RUN pnpm install --frozen-lockfile --prefer-offline

# Add .dockerignore to exclude unnecessary files
COPY . .

# Build with production optimization
RUN pnpm build


FROM nginx:1.25-alpine AS server

# Copy nginx configuration first
COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Use nginx's default user instead of custom one
USER nginx

# Expose port (documentation purpose)
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
