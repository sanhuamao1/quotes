# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY knexfile.js ./
COPY src/db/migrations ./src/db/migrations

RUN mkdir -p /app/data

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
