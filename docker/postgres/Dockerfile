# Not working at the moment... Would be nice to be able to get the actual pg_session_jwt extension working
FROM rust:bookworm AS rust-builder
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN mkdir /ext-src
WORKDIR /ext-src
RUN apt-get update && apt-get install -y wget
RUN wget https://github.com/neondatabase/pg_session_jwt/archive/refs/tags/v0.2.0.tar.gz -O pg_session_jwt.tar.gz && \
    echo "5ace028e591f2e000ca10afa5b1ca62203ebff014c2907c0ec3b29c36f28a1bb pg_session_jwt.tar.gz" | sha256sum --check && \
    mkdir pg_session_jwt-src && cd pg_session_jwt-src && tar xzf ../pg_session_jwt.tar.gz --strip-components=1 -C . && \
    sed -i 's/pgrx = "0.12.6"/pgrx = { version = "0.12.9", features = [ "unsafe-postgres" ] }/g' Cargo.toml && \
    sed -i 's/version = "0.12.6"/version = "0.12.9"/g' pgrx-tests/Cargo.toml && \
    sed -i 's/pgrx = "=0.12.6"/pgrx = { version = "=0.12.9", features = [ "unsafe-postgres" ] }/g' pgrx-tests/Cargo.toml && \
    sed -i 's/pgrx-macros = "=0.12.6"/pgrx-macros = "=0.12.9"/g' pgrx-tests/Cargo.toml && \
    sed -i 's/pgrx-pg-config = "=0.12.6"/pgrx-pg-config = "=0.12.9"/g' pgrx-tests/Cargo.toml
RUN cargo pgrx install --release

FROM postgres:latest

COPY --from=rust-builder /ext-src /usr/share/postgresql/17/extension/
