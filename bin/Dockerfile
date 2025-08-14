FROM node:22-slim
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    postgresql-client \
    curl \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and install bun
RUN corepack enable && \
    npm install -g bun

# Clone the production branch
RUN git clone --depth 1 --branch production https://github.com/openintegrations/openint.git .

# Install dependencies and build ONLY Next.js (skip migration)
RUN pnpm install --frozen-lockfile

# Build with environment variables, mock clerk keys as they won't be used in this headless version
RUN NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_JA==" CLERK_SECRET_KEY="sk_live_JA==" pnpm run --filter=web build:next

# Copy actual bootstrap.sql if it exists to the correct location
RUN if [ -f "bootstrap.sql" ]; then \
        cp bootstrap.sql /app/packages/db/scripts/bootstrap.sql; \
        echo "✅ Copied bootstrap.sql to migration directory"; \
    else \
        echo "⏭️  No bootstrap.sql found, skipping copy"; \
    fi

# Set up environment
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Validate, migrate, then start
CMD set -e && \
    echo "🚀 Starting OpenInt..." && \
    \
    echo "✅ Validating environment variables..." && \
    [ -n "$DATABASE_URL" ] || { echo "❌ ERROR: DATABASE_URL is required"; exit 1; } && \
    [ -n "$JWT_SECRET" ] || { echo "❌ ERROR: JWT_SECRET is required"; exit 1; } && \
    [ ${#JWT_SECRET} -ge 32 ] || { echo "❌ ERROR: JWT_SECRET must be at least 32 characters"; exit 1; } && \
    \
    echo "🔌 Testing database connectivity..." && \
    export DATABASE_URL="$DATABASE_URL" && \
    pg_isready --d="$DATABASE_URL" --timeout=30 || { echo "❌ ERROR: Cannot connect to database"; exit 1; } && \
    \
    echo "📊 Running database migrations..." && \
    pnpm migrate || { echo "❌ ERROR: Migration failed"; exit 1; } && \
    pnpm bootstrap || { echo "❌ ERROR: Bootstrap failed"; exit 1; } && \
    \
    echo "🎉 Starting OpenInt application..." && \
    cd apps/web && exec pnpm start