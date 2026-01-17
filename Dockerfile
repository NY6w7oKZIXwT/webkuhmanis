# Node version
FROM node:20-alpine AS base

# Backend build stage
FROM base AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# Frontend build stage
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend . 
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "dist/index.js"]
