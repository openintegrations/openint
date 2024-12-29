DROP TABLE IF EXISTS _migrations;

ALTER TABLE
  __drizzle_migrations
ADD
  COLUMN created_at_timestamp TIMESTAMP GENERATED ALWAYS AS (TO_TIMESTAMP(created_at / 1000)) STORED;
