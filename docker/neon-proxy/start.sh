#!/bin/bash

if [ -z "$PG_CONNECTION_STRING" ]; then
  echo "PG_CONNECTION_STRING is not set"
  exit 1
fi

# Create required tables
psql -Atx $PG_CONNECTION_STRING \
  -c "CREATE SCHEMA IF NOT EXISTS neon_control_plane" \
  -c "CREATE TABLE neon_control_plane.endpoints (endpoint_id VARCHAR(255) PRIMARY KEY, allowed_ips VARCHAR(255))"
  -c "CREATE TABLE neon_control_plane.endpoint_jwks (id VARCHAR PRIMARY KEY, jwks_url TEXT NOT NULL, audience TEXT NOT NULL, role_names TEXT[] NOT NULL, endpoint_id UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())"

# Start the neon-proxy
./neon-proxy \
  -c server.pem \
  -k server.key \
  --auth-backend=postgres \
  --auth-endpoint=$PG_CONNECTION_STRING \
  --wss=0.0.0.0:4445 \
  --is-auth-broker=true \
  &

# Start caddy reverse proxy
caddy run \
  --config ./Caddyfile \
  --adapter caddyfile \
  &

wait -n
exit $?
