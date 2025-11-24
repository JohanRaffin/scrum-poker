# Multi-stage Dockerfile for Scrum Poker application
# Stage 1: Build the frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Setup backend and serve application
FROM node:22-alpine AS production

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies (production only)
RUN cd server && npm ci --production

# Copy server source code
COPY server/server.js ./server/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./dist

# Expose the application port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
WORKDIR /app/server
CMD ["node", "server.js"]
