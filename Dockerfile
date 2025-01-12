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

# Add non-root user for security
RUN adduser -D -u 1000 nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html

# Copy nginx configuration
COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Use non-root user
USER nginx-user

# Expose port (documentation purpose)
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
