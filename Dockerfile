# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build args
COPY . .

# GEMINI_API_KEY is injected at runtime via Cloud Run env vars,
# NOT baked into the image. Vite reads it from process.env at build time
# so we pass a placeholder — the real key is set in Cloud Run.
ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=$GEMINI_API_KEY

ARG VITE_GOOGLE_MAPS_API_KEY=""
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA (handles client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requires the container to listen on PORT env var (default 8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
