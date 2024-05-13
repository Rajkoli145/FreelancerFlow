# Use a pinned base image as per platform rules
FROM node:20.11.1-slim

# Set working directory to /app (approved destination)
WORKDIR /app

# Copy everything including .git history (required for tasks)
# Rule: Always use COPY . .
COPY . .

# Install production dependencies using a lockfile-driven install
# Rule: npm ci is allowed with a lockfile
RUN cd backend && npm ci --omit=dev

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Run as non-root user for security
USER node

# Start the application
CMD ["node", "backend/src/index.js"]
