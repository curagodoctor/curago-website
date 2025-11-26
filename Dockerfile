# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps (falls back to install if lock is out-of-sync)
COPY package*.json ./
RUN npm ci || npm install

# Copy source and build
COPY . .
RUN set -eux; \
  npm run build; \
  mkdir -p /build; \
  # Collect build artifacts from common locations
  for d in \
    "dist" \
    "build" \
    "out" \
    "client/dist" \
    "frontend/dist" \
    "apps/web/dist" \
    "apps/website/dist" \
    "packages/web/dist" \
    "packages/website/dist" \
  ; do \
    if [ -d "$d" ]; then \
      echo ">> Found build dir: $d"; \
      cp -R "$d"/. /build/; \
    fi; \
  done; \
  # Fail clearly if nothing got copied
  if [ ! -d /build ] || [ -z "$(ls -A /build)" ]; then \
    echo "ERROR: No static build output was found."; \
    echo "Checked: dist, build, out, client/dist, frontend/dist, apps/*/dist, packages/*/dist"; \
    echo "Contents of /app:"; ls -la; \
    echo "Top-level dirs:"; find . -maxdepth 2 -type d -print; \
    exit 1; \
  fi

# ---------- Stage 2: Serve (Nginx) ----------
FROM nginx:alpine

# Your custom nginx with SPA fallback, gzip, cache, /health
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy whatever the builder discovered into web root
COPY --from=builder /build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
