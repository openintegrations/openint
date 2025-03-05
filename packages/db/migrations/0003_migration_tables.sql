DROP TABLE IF EXISTS _migrations; --> statement-breakpoint

-- Workaround for the fact that some drizzle migrator drivers are no capable of using the public schema
-- and insists on using the drizzle schema.
DO $$
BEGIN
    -- Try to execute in public schema first
    ALTER TABLE public.__drizzle_migrations
    ADD COLUMN created_at_timestamp TIMESTAMP GENERATED ALWAYS AS (TO_TIMESTAMP(created_at / 1000)) STORED;

    RAISE NOTICE 'Successfully modified __drizzle_migrations in public schema';
EXCEPTION WHEN undefined_table THEN
    -- If it fails, try in drizzle schema
    ALTER TABLE drizzle.__drizzle_migrations
    ADD COLUMN created_at_timestamp TIMESTAMP GENERATED ALWAYS AS (TO_TIMESTAMP(created_at / 1000)) STORED;

    RAISE NOTICE 'Successfully modified __drizzle_migrations in drizzle schema';
END;
$$; --> statement-breakpoint
