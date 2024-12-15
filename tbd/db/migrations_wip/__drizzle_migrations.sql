
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
INSERT INTO "drizzle"."__drizzle_migrations" ("id", "hash", "created_at") VALUES
(1, '563f0bc57d87e284c71533a5f67e1b525de720cf6727eed140f6c384ef06c995', 1734221536864);
