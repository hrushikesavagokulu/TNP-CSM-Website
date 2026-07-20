# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copy dependency manifests first (layer-cache optimisation)
COPY package*.json ./

# Install only production deps
RUN npm install --omit=dev

# Copy application source
COPY . .

# ── Expose & Run ──────────────────────────────────────────────────────────────
EXPOSE 5000

# Use node directly (not nodemon) in container
CMD ["node", "server.js"]
