CREATE TABLE IF NOT EXISTS events (
    id             CHARACTER VARYING NOT NULL DEFAULT generate_ulid(),
    name           TEXT NOT NULL,
    organization_id BIGINT NOT NULL,
    customer_id    BIGINT,
    data           JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_events PRIMARY KEY (id)
);
