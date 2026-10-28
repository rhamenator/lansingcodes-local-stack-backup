# Use Node.js 22 base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the project
RUN npm run build

# Expose port for Netlify Lambda dev server
EXPOSE 9000

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]
