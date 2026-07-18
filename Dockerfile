# --- Stage 1: build ---
FROM node:22-alpine AS builder
WORKDIR /app

# Install ALL deps (incl. dev) for compiling TS
COPY package.json package-lock.json ./
RUN npm ci

# Compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop dev deps so we can copy a clean node_modules into the runner
RUN npm prune --production

# --- Stage 2: runtime ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Run as the non-root user that node:alpine ships
USER node

# Copy production deps + compiled output
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=builder /app/dist ./dist

CMD ["npm", "run", "start"]
