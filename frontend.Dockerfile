# ---------- 1️⃣ Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps only once for caching
COPY bigfm-frontend/package*.json ./
RUN npm install

# Copy source code and build
COPY bigfm-frontend ./
RUN npm run build

# ---------- 2️⃣ NGINX Stage ----------
FROM nginx:alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy build output to NGINX html directory
COPY --from=builder /app/build /usr/share/nginx/html

# Custom NGINX config to fix SPA routes (avoids 404 on /dashboard)
COPY bigfm-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
