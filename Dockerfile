FROM node:20-alpine

WORKDIR /app

# Clear npm cache upfront
RUN npm cache clean --force

# Copy package files
COPY package*.json ./

# Install dependencies fresh
RUN npm ci --no-cache

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Make absolutely sure we run tsx, not npm start
ENTRYPOINT ["npx"]
CMD ["tsx", "src/server.ts"]
