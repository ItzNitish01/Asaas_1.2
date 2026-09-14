# Production Multi-Stage Dockerfile for ASAAS Real-Time Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install native dependencies required by sqlite3 build
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
