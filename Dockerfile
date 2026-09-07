FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for tsx)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start application with tsx
CMD ["npx", "tsx", "src/server.ts"]
