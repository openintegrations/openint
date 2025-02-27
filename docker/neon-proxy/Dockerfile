# hadolint global ignore=DL3008

ARG NEON_RELEASE_TAG=release-7845

FROM rust:bookworm AS rust-builder
ARG NEON_RELEASE_TAG

ARG DEBIAN_FRONTEND=noninteractive
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# install apt dependencies
RUN \
  apt-get update -qq \
  && apt-get install -qq --no-install-recommends -o DPkg::Options::=--force-confold -o DPkg::Options::=--force-confdef \
  build-essential \
  pkg-config \
  git \
  libssl-dev \
  && apt-get clean -qq && rm -rf /var/lib/apt/lists/*

# get and build the proxy
RUN git clone --depth=1 --branch $NEON_RELEASE_TAG https://github.com/neondatabase/neon.git
WORKDIR /neon
RUN cargo build --bin proxy --features "testing"


FROM debian:bookworm-slim

ARG DEBIAN_FRONTEND=noninteractive
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# install apt dependencies
RUN \
  apt-get update -qq \
  && apt-get install -qq --no-install-recommends -o DPkg::Options::=--force-confold -o DPkg::Options::=--force-confdef \
  curl \
  ca-certificates \
  openssl \
  postgresql-client \
  && apt-get clean -qq && rm -rf /var/lib/apt/lists/*

# install caddy
RUN \
  apt-get update -qq \
  && apt-get install -qq --no-install-recommends -o DPkg::Options::=--force-confold -o DPkg::Options::=--force-confdef \
  gnupg2 debian-keyring debian-archive-keyring apt-transport-https \
  && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg2 --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
  && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list \
  && apt-get update -qq \
  && apt-get install -qq --no-install-recommends -o DPkg::Options::=--force-confold -o DPkg::Options::=--force-confdef \
  caddy \
  && apt-get clean -qq && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# create a self-signed cert for *.localtest.me (see https://readme.localtest.me/)
RUN openssl req -new -x509 \
  -days 365 \
  -nodes -text \
  -out server.pem \
  -keyout server.key \
  -subj "/CN=*.localtest.me" \
  -addext "subjectAltName = DNS:*.localtest.me"

# copy the proxy binary
COPY --from=rust-builder /neon/target/debug/proxy ./neon-proxy

COPY ./Caddyfile Caddyfile
COPY ./start.sh start.sh

RUN chmod +x start.sh

EXPOSE 4444
ENTRYPOINT ["./start.sh"]
