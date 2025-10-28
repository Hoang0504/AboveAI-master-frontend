# ---------- Base Stage ----------
FROM node:20 AS base

WORKDIR /app

# ---------- Dependencies Stage ----------
FROM base AS deps

WORKDIR /app/web/frontend

COPY web/frontend/package.json web/frontend/yarn.lock* web/frontend/package-lock.json* web/frontend/pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---------- Build Stage ----------
FROM base AS builder

WORKDIR /app/web/frontend

COPY --from=deps /app/web/frontend/node_modules ./node_modules
COPY web/frontend .

# Define build args
ARG VITE_API_URL
ARG VITE_PORT
ARG VITE_ORIGIN
ARG VITE_BASE

ARG VITE_SHOPIFY_DOMAIN
ARG VITE_SHOPIFY_STOREFRONT_TOKEN
ARG VITE_STRIPE_PUBLISHABLE_KEY

# Write them to a .env file before build
RUN echo "VITE_API_URL=$VITE_API_URL" >> .env && \
    echo "VITE_PORT=$VITE_PORT" >> .env && \
    echo "VITE_ORIGIN=$VITE_ORIGIN" >> .env && \
    echo "VITE_BASE=$VITE_BASE" >> .env && \
    echo "VITE_SHOPIFY_DOMAIN=$VITE_SHOPIFY_DOMAIN" >> .env && \
    echo "VITE_SHOPIFY_STOREFRONT_TOKEN=$VITE_SHOPIFY_STOREFRONT_TOKEN" >> .env && \
    echo "VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY" >> .env

RUN npm run build

# ---------- Production Runner Stage ----------
FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g serve

COPY --from=builder /app/web/frontend/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
