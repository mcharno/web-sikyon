FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/src ./src
COPY backend/public ./public

# Set environment
ENV NODE_ENV=production
ENV PORT=3180

EXPOSE 3180

# Run as non-root user
USER node

CMD ["node", "src/index.js"]
