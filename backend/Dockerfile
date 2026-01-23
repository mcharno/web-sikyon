# Multi-stage build for Node.js Express backend
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable

# Copy workspace root files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy workspace package files
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Install all dependencies (workspace will handle it)
RUN yarn install --frozen-lockfile

# Copy backend source and data
COPY backend/src ./backend/src
COPY backend/public ./backend/public

# Production stage
FROM node:20-alpine

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable

# Copy dependencies and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml

# Change ownership to existing node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3180

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3180/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "backend/src/index.js"]
