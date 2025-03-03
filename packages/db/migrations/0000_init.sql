BEGIN;
--> statement-breakpoint
--- filename: 0_setup-ulid.sql ---

DO $outer$
BEGIN
-- pgulid is based on OK Log's Go implementation of the ULID spec
--
-- https://github.com/oklog/ulid
-- https://github.com/ulid/spec
--
-- Copyright 2016 The Oklog Authors
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
-- http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION generate_ulid()
RETURNS TEXT
AS $$
DECLARE
  -- Crockford's Base32
  encoding   BYTEA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  timestamp  BYTEA = E'\\000\\000\\000\\000\\000\\000';
  output     TEXT = '';

  unix_time  BIGINT;
  ulid       BYTEA;
BEGIN
  -- 6 timestamp bytes
  unix_time = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  timestamp = SET_BYTE(timestamp, 0, (unix_time >> 40)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 1, (unix_time >> 32)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 2, (unix_time >> 24)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 3, (unix_time >> 16)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 4, (unix_time >> 8)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 5, unix_time::BIT(8)::INTEGER);

  -- 10 entropy bytes
  ulid = timestamp || gen_random_bytes(10);

  -- Encode the timestamp
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 0) & 224) >> 5));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 0) & 31)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 1) & 248) >> 3));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 1) & 7) << 2) | ((GET_BYTE(ulid, 2) & 192) >> 6)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 2) & 62) >> 1));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 2) & 1) << 4) | ((GET_BYTE(ulid, 3) & 240) >> 4)));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 3) & 15) << 1) | ((GET_BYTE(ulid, 4) & 128) >> 7)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 4) & 124) >> 2));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 4) & 3) << 3) | ((GET_BYTE(ulid, 5) & 224) >> 5)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 5) & 31)));

  -- Encode the entropy
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 6) & 248) >> 3));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 6) & 7) << 2) | ((GET_BYTE(ulid, 7) & 192) >> 6)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 7) & 62) >> 1));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 7) & 1) << 4) | ((GET_BYTE(ulid, 8) & 240) >> 4)));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 8) & 15) << 1) | ((GET_BYTE(ulid, 9) & 128) >> 7)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 9) & 124) >> 2));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 9) & 3) << 3) | ((GET_BYTE(ulid, 10) & 224) >> 5)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 10) & 31)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 11) & 248) >> 3));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 11) & 7) << 2) | ((GET_BYTE(ulid, 12) & 192) >> 6)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 12) & 62) >> 1));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 12) & 1) << 4) | ((GET_BYTE(ulid, 13) & 240) >> 4)));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 13) & 15) << 1) | ((GET_BYTE(ulid, 14) & 128) >> 7)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 14) & 124) >> 2));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 14) & 3) << 3) | ((GET_BYTE(ulid, 15) & 224) >> 5)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 15) & 31)));

  RETURN output;
END
$$
LANGUAGE plpgsql
VOLATILE;

EXCEPTION WHEN OTHERS THEN
  -- This block executes if the extension creation fails
  RAISE NOTICE 'Failed to load pgcrypto for ulid, fallback using uuid: %', SQLERRM;

  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE OR REPLACE FUNCTION uuid_to_ulid(id uuid) RETURNS text AS $$
  DECLARE
    encoding   bytea = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    output     text  = '';
    uuid_bytes bytea = uuid_send(id);
  BEGIN

    -- Encode the timestamp
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 0) & 224) >> 5));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 0) & 31)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 1) & 248) >> 3));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 1) & 7) << 2) | ((GET_BYTE(uuid_bytes, 2) & 192) >> 6)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 2) & 62) >> 1));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 2) & 1) << 4) | ((GET_BYTE(uuid_bytes, 3) & 240) >> 4)));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 3) & 15) << 1) | ((GET_BYTE(uuid_bytes, 4) & 128) >> 7)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 4) & 124) >> 2));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 4) & 3) << 3) | ((GET_BYTE(uuid_bytes, 5) & 224) >> 5)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 5) & 31)));

    -- Encode the entropy
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 6) & 248) >> 3));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 6) & 7) << 2) | ((GET_BYTE(uuid_bytes, 7) & 192) >> 6)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 7) & 62) >> 1));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 7) & 1) << 4) | ((GET_BYTE(uuid_bytes, 8) & 240) >> 4)));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 8) & 15) << 1) | ((GET_BYTE(uuid_bytes, 9) & 128) >> 7)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 9) & 124) >> 2));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 9) & 3) << 3) | ((GET_BYTE(uuid_bytes, 10) & 224) >> 5)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 10) & 31)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 11) & 248) >> 3));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 11) & 7) << 2) | ((GET_BYTE(uuid_bytes, 12) & 192) >> 6)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 12) & 62) >> 1));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 12) & 1) << 4) | ((GET_BYTE(uuid_bytes, 13) & 240) >> 4)));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 13) & 15) << 1) | ((GET_BYTE(uuid_bytes, 14) & 128) >> 7)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 14) & 124) >> 2));
    output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(uuid_bytes, 14) & 3) << 3) | ((GET_BYTE(uuid_bytes, 15) & 224) >> 5)));
    output = output || CHR(GET_BYTE(encoding, (GET_BYTE(uuid_bytes, 15) & 31)));

    RETURN output;
  END
  $$
  LANGUAGE plpgsql
  IMMUTABLE;

  CREATE OR REPLACE FUNCTION generate_ulid() RETURNS text AS $$
  BEGIN
    RETURN uuid_to_ulid(uuid_generate_v4());
  END
  $$
  LANGUAGE plpgsql
  IMMUTABLE;

END;
$outer$;

--- filename: 1_create-table.sql ---
-- Setup the migrations table itself...
CREATE TABLE IF NOT EXISTS "public"."_migrations" (
    "name" text NOT NULL,
    "hash" text NOT NULL,
    "date" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("name")
);

--
-- Meta: App level
--


-- TODO(p2): Add generated column as well as indexes on them (e.g. institution name full text search)

-- TODO(p3): Add check guards id prefixes...
-- TODO(p3): Switch to the references / primary key syntax
-- TODO(p3): Use varchar rather than character varying to be shorter

CREATE TABLE IF NOT EXISTS "public"."integration" (
  "id" character varying NOT NULL DEFAULT generate_ulid(),
  "provider_name" character varying NOT NULL GENERATED ALWAYS AS (split_part(id, '_', 2)) STORED,
  -- "standard" jsonb NOT NULL DEFAULT '{}', What should it be?
  "config" jsonb NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_integration" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS integration_created_at ON integration (created_at);
CREATE INDEX IF NOT EXISTS integration_updated_at ON integration (updated_at);
CREATE INDEX IF NOT EXISTS integration_provider_name ON integration (provider_name);

CREATE TABLE IF NOT EXISTS "public"."institution" (
  "id" character varying NOT NULL DEFAULT generate_ulid(),
  "provider_name" character varying NOT NULL GENERATED ALWAYS AS (split_part(id, '_', 2)) STORED,
  "standard" jsonb NOT NULL DEFAULT '{}',
  "external" jsonb NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_institution" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS institution_created_at ON institution (created_at);
CREATE INDEX IF NOT EXISTS institution_updated_at ON institution (updated_at);
CREATE INDEX IF NOT EXISTS institution_provider_name ON institution (provider_name);

--
-- Meta: Ledger specific
--

CREATE TABLE IF NOT EXISTS "public"."connection" (
  "id" character varying NOT NULL DEFAULT generate_ulid(),
  "provider_name" character varying NOT NULL GENERATED ALWAYS AS (split_part(id, '_', 2)) STORED,
  -- Allow ledger_id to be nullable for now otherwise upsert query doesn't work
  -- even for updates to existing connections unless ledger_id is provided...
  "ledger_id" character varying,
  "integration_id" character varying,
  "institution_id" character varying,
  "env_name" character varying,
  -- "standard" jsonb NOT NULL DEFAULT '{}', What should it be?
  "settings" jsonb NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_connection" PRIMARY KEY ("id"),
  CONSTRAINT "fk_integration_id" FOREIGN KEY ("integration_id")
    REFERENCES "public"."integration"("id") ON DELETE RESTRICT,
  CONSTRAINT "fk_institution_id" FOREIGN KEY ("institution_id")
    REFERENCES "public"."institution"("id") ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS connection_created_at ON connection (created_at);
CREATE INDEX IF NOT EXISTS connection_updated_at ON connection (updated_at);
CREATE INDEX IF NOT EXISTS connection_provider_name ON connection (provider_name);

CREATE TABLE IF NOT EXISTS "public"."pipeline" (
  "id" character varying NOT NULL DEFAULT generate_ulid(),
  "source_id" character varying,
  "source_state" jsonb NOT NULL DEFAULT '{}',
  "destination_id" character varying,
  "destination_state" jsonb NOT NULL DEFAULT '{}',
  "link_options" jsonb NOT NULL DEFAULT '[]',
  "last_sync_started_at" TIMESTAMP WITH TIME ZONE,
  "last_sync_completed_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_pipeline" PRIMARY KEY ("id"),
  CONSTRAINT "fk_source_id" FOREIGN KEY ("source_id")
    REFERENCES "public"."connection"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_destination_id" FOREIGN KEY ("destination_id")
    REFERENCES "public"."connection"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pipeline_created_at ON pipeline (created_at);
CREATE INDEX IF NOT EXISTS pipeline_updated_at ON pipeline (updated_at);

--
-- Data
--

CREATE TABLE IF NOT EXISTS "public"."transaction" (
  "id" character varying NOT NULL DEFAULT generate_ulid(),
  "provider_name" character varying NOT NULL GENERATED ALWAYS AS (split_part(id, '_', 2)) STORED,
  "source_id" character varying, -- Intentionally no reference, may be stored in separate db
  "standard" jsonb NOT NULL DEFAULT '{}',
  "external" jsonb NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_transaction" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS transaction_created_at ON transaction (created_at);
CREATE INDEX IF NOT EXISTS transaction_updated_at ON transaction (updated_at);
CREATE INDEX IF NOT EXISTS transaction_provider_name ON transaction (provider_name);
CREATE INDEX IF NOT EXISTS transaction_source_id ON transaction (source_id);

CREATE TABLE IF NOT EXISTS "public"."account" (
  "id" character varying NOT NULL DEFAULT generate_ulid(),
  "provider_name" character varying NOT NULL GENERATED ALWAYS AS (split_part(id, '_', 2)) STORED,
  "source_id" character varying,
  "standard" jsonb NOT NULL DEFAULT '{}',
  "external" jsonb NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_account" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS account_created_at ON account (created_at);
CREATE INDEX IF NOT EXISTS account_updated_at ON account (updated_at);
CREATE INDEX IF NOT EXISTS account_provider_name ON account (provider_name);
CREATE INDEX IF NOT EXISTS account_source_id ON account (source_id);

CREATE TABLE IF NOT EXISTS "public"."commodity" (
  "id" character varying NOT NULL DEFAULT generate_ulid(),
  "provider_name" character varying NOT NULL GENERATED ALWAYS AS (split_part(id, '_', 2)) STORED,
  "source_id" character varying,
  "standard" jsonb NOT NULL DEFAULT '{}',
  "external" jsonb NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_commodity" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS commodity_created_at ON commodity (created_at);
CREATE INDEX IF NOT EXISTS commodity_updated_at ON commodity (updated_at);
CREATE INDEX IF NOT EXISTS commodity_provider_name ON commodity (provider_name);
CREATE INDEX IF NOT EXISTS commodity_source_id ON commodity (source_id);

-- Add balance table
-- Add price table
;

--- filename: 2023-01-06_rls.sql ---
-- Unfortunately we cannot do this because of of 1) uuid <> varchar mismatch
-- 2) OSS where users are managed outside of supabase
-- ALTER TABLE "public"."connection" DROP COLUMN "ledger_id"; -- Not yet, but soon
-- ALTER TABLE "public"."connection" ADD COLUMN "creator_id" uuid; -- TODO: Make me not null
-- ALTER TABLE "public"."connection" ADD CONSTRAINT "fk_connection_creator_id"
--   FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."connection" RENAME COLUMN "ledger_id" to "creator_id";
CREATE INDEX IF NOT EXISTS connection_creator_id ON connection (creator_id);


-- TODO: Do things like easy mustache template for SQL exist? So we can avoid the duplication without needing to go into a full programming language?

-- Workaround for RLS issue where user can invoke `auth.connection_ids` but not
-- the referenced function inside with is `auth.uid`
-- Overall this seems safer than granting privileges on the auth schema which the postres user
-- does not have by default anyways...
CREATE OR REPLACE FUNCTION public._uid()
 RETURNS varchar
 LANGUAGE sql
 STABLE
AS $function$
  select
  	case when starts_with(current_user, 'usr_') then
  		substring(CURRENT_USER, 5) -- 1 indexed
  	else
      coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
      )
	  end
$function$;

-- Given that we allow user to actually login to postgres with raw URL, we need to
-- prevent them from impersonating other users...
CREATE SCHEMA IF NOT EXISTS auth;
DROP FUNCTION IF EXISTS auth.uid CASCADE;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS varchar LANGUAGE sql STABLE
AS $function$
  select public._uid()
$function$;

CREATE OR REPLACE FUNCTION auth.connection_ids()
 RETURNS varchar[]
 LANGUAGE sql
 STABLE
AS $function$
  select array(select id from "connection" where creator_id = public._uid())
$function$;

ALTER TABLE "public"."connection" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "creator_access" on "public"."connection";
CREATE POLICY "creator_access" ON "public"."connection"
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());


CREATE INDEX IF NOT EXISTS pipeline_source_id ON "pipeline" (source_id);
CREATE INDEX IF NOT EXISTS pipeline_destination_id ON "pipeline" (destination_id);

ALTER TABLE "public"."pipeline" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "connection_creator_access" on "public"."pipeline";
CREATE POLICY "connection_creator_access" ON "public"."pipeline"
  USING ("source_id" = ANY(auth.connection_ids()) OR "destination_id" = ANY(auth.connection_ids()))
  WITH CHECK ("source_id" = ANY(auth.connection_ids()) OR "destination_id" = ANY(auth.connection_ids()));


-- Contains secrets that shouldn't be publicly available
ALTER TABLE "public"."integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."institution" ENABLE ROW LEVEL SECURITY;
-- Should this be allowed?
CREATE POLICY "public_readable" ON public.institution FOR SELECT USING (true);

-- Beware postgres does not automatically create indexes on foreign keys
-- https://stackoverflow.com/questions/970562/postgres-and-indexes-on-foreign-keys-and-primary-keys

--| Transaction |--

ALTER TABLE "public"."transaction" ADD COLUMN "ledger_connection_id" VARCHAR; -- How do we make this non-null?
ALTER TABLE "public"."transaction" ADD CONSTRAINT "fk_transaction_ledger_connection_id"
  FOREIGN KEY ("ledger_connection_id") REFERENCES "public"."connection"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS transaction_ledger_creator_id ON "transaction" (ledger_connection_id);

ALTER TABLE "public"."transaction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ledger_connection_creator_access" on "public"."transaction";
CREATE POLICY "ledger_connection_creator_access" ON "public"."transaction"
  USING (ledger_connection_id = ANY(auth.connection_ids()))
  WITH CHECK (ledger_connection_id = ANY(auth.connection_ids()));

--| Account |--

ALTER TABLE "public"."account" ADD COLUMN "ledger_connection_id" varchar;
ALTER TABLE "public"."account" ADD CONSTRAINT "fk_account_ledger_connection_id"
  FOREIGN KEY ("ledger_connection_id") REFERENCES "public"."connection"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS account_ledger_creator_id ON "account" (ledger_connection_id);

ALTER TABLE "public"."account" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ledger_connection_creator_access" on "public"."account";
CREATE POLICY "ledger_connection_creator_access" ON "public"."account"
  USING (ledger_connection_id = ANY(auth.connection_ids()))
  WITH CHECK (ledger_connection_id = ANY(auth.connection_ids()));

--| Commodity |--
ALTER TABLE "public"."commodity" ADD COLUMN "ledger_connection_id" varchar;
ALTER TABLE "public"."commodity" ADD CONSTRAINT "fk_commodity_ledger_connection_id"
  FOREIGN KEY ("ledger_connection_id") REFERENCES "public"."connection"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS commodity_ledger_creator_id ON "commodity" (ledger_connection_id);


ALTER TABLE "public"."commodity" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ledger_connection_creator_access" on "public"."commodity";
CREATE POLICY "ledger_connection_creator_access" ON "public"."commodity"
  USING (ledger_connection_id = ANY(auth.connection_ids()))
  WITH CHECK (ledger_connection_id = ANY(auth.connection_ids()));


;

--- filename: 2023-01-25_rename_to_raw.sql ---
ALTER TABLE "public"."transaction" RENAME TO "raw_transaction";
ALTER TABLE "public"."account" RENAME TO "raw_account";
ALTER TABLE "public"."commodity" RENAME TO "raw_commodity";
;

--- filename: 2023-01-27_rename_connection_to_resource.sql ---
--- Meta table updates

ALTER TABLE "public"."connection" RENAME TO "resource";
ALTER TABLE "public"."resource" RENAME CONSTRAINT pk_connection TO pk_resource;
ALTER INDEX connection_created_at RENAME TO resource_created_at;
ALTER INDEX connection_updated_at RENAME TO resource_updated_at;
ALTER INDEX connection_provider_name RENAME TO resource_provider_name;
ALTER INDEX connection_creator_id RENAME TO resource_creator_id;
ALTER POLICY connection_creator_access ON public.pipeline RENAME TO resource_creator_access;

ALTER TABLE "public"."pipeline" DROP CONSTRAINT fk_destination_id,
	ADD CONSTRAINT "fk_destination_id" FOREIGN KEY ("destination_id")
    REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."pipeline" DROP CONSTRAINT fk_source_id,
	ADD CONSTRAINT "fk_source_id" FOREIGN KEY ("source_id")
    REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

--- Data table update

ALTER TABLE "public"."raw_transaction" RENAME COLUMN "ledger_connection_id" TO "ledger_resource_id";
ALTER TABLE "public"."raw_account" RENAME COLUMN "ledger_connection_id" TO "ledger_resource_id";
ALTER TABLE "public"."raw_commodity" RENAME COLUMN "ledger_connection_id" TO "ledger_resource_id";


ALTER TABLE "public"."raw_account" DROP CONSTRAINT fk_account_ledger_connection_id,
	ADD CONSTRAINT "fk_account_ledger_connection_id" FOREIGN KEY ("ledger_resource_id")
    REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "public"."raw_transaction" DROP CONSTRAINT fk_transaction_ledger_connection_id,
	ADD CONSTRAINT "fk_transaction_ledger_connection_id" FOREIGN KEY ("ledger_resource_id")
    REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "public"."raw_commodity" DROP CONSTRAINT fk_commodity_ledger_connection_id,
	ADD CONSTRAINT "fk_commodity_ledger_connection_id" FOREIGN KEY ("ledger_resource_id")
    REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER POLICY ledger_connection_creator_access ON public.raw_transaction RENAME TO ledger_resource_creator_access;
ALTER POLICY ledger_connection_creator_access ON public.raw_account RENAME TO ledger_resource_creator_access;
ALTER POLICY ledger_connection_creator_access ON public.raw_commodity RENAME TO ledger_resource_creator_access;

--- RLS update

ALTER FUNCTION auth.connection_ids RENAME TO resource_ids;

CREATE OR REPLACE FUNCTION auth.resource_ids()
 RETURNS character varying[]
 LANGUAGE sql
 STABLE
AS $function$
  select array(select id from "resource" where creator_id = public._uid())
$function$;

-- Update existing data


-- select 'reso_' || SUBSTRING(id, 6) from resource where starts_with(id, 'conn_');
UPDATE resource set id = 'reso_' || SUBSTRING(id, 6) where starts_with(id, 'conn_');
UPDATE raw_account set source_id = 'reso_' || SUBSTRING(source_id, 6) where starts_with(source_id, 'conn_');
UPDATE raw_transaction set source_id = 'reso_' || SUBSTRING(source_id, 6) where starts_with(source_id, 'conn_');
UPDATE raw_commodity set source_id = 'reso_' || SUBSTRING(source_id, 6) where starts_with(source_id, 'conn_');
;

--- filename: 2023-02-01_user_apikey_index.sql ---
DO $$
BEGIN
  IF (SELECT to_regclass('auth.users') IS NOT null)
  THEN
    CREATE INDEX IF NOT EXISTS users_api_key
    ON "auth"."users" ((raw_app_meta_data ->> 'apiKey'));
  END IF;
END $$
;

--- filename: 2023-02-02_add_connection_name.sql ---
ALTER TABLE "public"."resource" ADD COLUMN "display_name" varchar;
;

--- filename: 2023-02-03_graphql_comments.sql ---
-- @see https://github.com/supabase/pg_graphql/issues/167
comment on constraint fk_source_id
  on "pipeline"
  is E'@graphql({"foreign_name": "source", "local_name": "sourceOfPipelines"})';

comment on constraint fk_destination_id
  on "pipeline"
  is E'@graphql({"foreign_name": "destination", "local_name": "destinationOfPipelines"})';
;

--- filename: 2023-02-22_institution_rls.sql ---

CREATE OR REPLACE FUNCTION auth.institution_ids()
 RETURNS character varying[]
 LANGUAGE sql
 STABLE
AS $function$
  select array(
    SELECT DISTINCT institution_id FROM "resource"
    WHERE creator_id = public._uid () AND institution_id IS NOT NULL
  )
$function$;

DROP POLICY IF EXISTS "public_readable" on "public"."institution";
DROP POLICY IF EXISTS "connection_creator_access" on "public"."institution";
CREATE POLICY "connection_creator_access" ON "public"."institution"
  USING ("id" = ANY(auth.institution_ids()))
  WITH CHECK ("id" = ANY(auth.institution_ids()));
;

--- filename: 2023-02-27_remove_database_users.sql ---
-- Delete existing database users

DO $$
DECLARE
	ele record;
BEGIN
	FOR ele IN
		SELECT
			usename
		FROM
			pg_user
		WHERE
			starts_with (usename, 'usr_')
	LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM %I', ele.usename);
    EXECUTE format('REVOKE USAGE ON SCHEMA public FROM %I', ele.usename);
    EXECUTE format('DROP USER %I', ele.usename);
	END LOOP;
END;
$$;

-- Remove the reference to CURRENT_USER in RLS functions by resetting the uid function -- CURRENT_USER

CREATE OR REPLACE FUNCTION public._uid()
 RETURNS varchar
 LANGUAGE sql
 STABLE
AS $function$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )
$function$;

-- Setup helper functions for testing policies moving forward
-- @see https://github.com/supabase/supabase/blob/master/apps/docs/pages/guides/auth/row-level-security.mdx#testing-policies

DO
$do$
BEGIN
-- Surround in a check so that this migration does not fail in a vanilla postgres instance
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'anon') THEN
      RAISE NOTICE 'Role "anon" does not exists. Skipping grant.';
   ELSE
      grant anon, authenticated to postgres;
   END IF;
END
$do$;


create or replace procedure auth.login_as_user (user_email text)
    language plpgsql
    as $$
declare
    auth_user record;
begin
    select
        * into auth_user
    from
        auth.users
    where
        email = user_email;
    execute format('set request.jwt.claim.sub=%L', auth_user.id::text);
    execute format('set request.jwt.claim.role=%I', auth_user.role);
    execute format('set request.jwt.claim.email=%L', auth_user.email);
    execute format('set request.jwt.claims=%L', json_strip_nulls(json_build_object('app_metadata', auth_user.raw_app_meta_data))::text);

    -- https://share.cleanshot.com/9Yrd6Zsg Not sure why we are getting this, temp workaround
    -- raise notice '%', format('set role %I; -- logging in as %L (%L)', auth_user.role, auth_user.id, auth_user.email);
    raise notice 'set role as user';

    execute format('set role %I', auth_user.role);
end
$$;

create or replace procedure auth.login_as_anon ()
    language plpgsql
    as $$
begin
    set request.jwt.claim.sub='';
    set request.jwt.claim.role='';
    set request.jwt.claim.email='';
    set request.jwt.claims='';
    set role anon;
end
$$;

create or replace procedure auth.logout ()
    language plpgsql
    as $$
begin
    set request.jwt.claim.sub='';
    set request.jwt.claim.role='';
    set request.jwt.claim.email='';
    set request.jwt.claims='';
    set role postgres;
end
$$;
;

--- filename: 2023-02-27_revoke_anon.sql ---

-- TODO: Use the supabase image rather than postgres image for testing in ci
DO
$do$
BEGIN
-- Surround in a check so that this migration does not fail in a vanilla postgres instance
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'anon') THEN
      RAISE NOTICE 'Role "anon" does not exists. Skipping grant.';
   ELSE
      REVOKE ALL PRIVILEGES ON public._migrations from anon, authenticated;
   END IF;
END
$do$;

;

--- filename: 2023-02-28_1307_enable_realtime_publications.sql ---
-- https://supabase.com/docs/guides/realtime/quickstart
-- https://supabase.com/docs/guides/auth/row-level-security#enable-realtime-for-database-tables

BEGIN;
  DROP publication IF EXISTS supabase_realtime;
  CREATE publication supabase_realtime;
  ALTER publication supabase_realtime ADD TABLE integration, resource, pipeline, institution;
COMMIT;

-- ALTER publication supabase_realtime DROP TABLE integration, resource, pipeline, institution;
;

--- filename: 2023-02-28_1954_remove_public_uid.sql ---
CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS varchar
 LANGUAGE sql
 STABLE
AS $function$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )
$function$;


CREATE OR REPLACE FUNCTION auth.resource_ids()
 RETURNS character varying[]
 LANGUAGE sql
 STABLE
AS $function$
  select array(select id from "resource" where creator_id = auth.uid())
$function$;

CREATE OR REPLACE FUNCTION auth.institution_ids()
 RETURNS character varying[]
 LANGUAGE sql
 STABLE
AS $function$
  select array(
    SELECT DISTINCT institution_id FROM "resource"
    WHERE creator_id = auth.uid() AND institution_id IS NOT NULL
  )
$function$;

-- This workaround is no longer needed now that user are not logging in directly anhmore.
DROP FUNCTION IF EXISTS public._uid();
;

--- filename: 2023-04-02_0140_admin_user.sql ---
create or replace procedure auth.set_user_admin (user_email text, admin boolean)
    language plpgsql
    as $$
declare
    auth_user record;
begin
	UPDATE
		auth.users
	SET
		raw_app_meta_data = raw_app_meta_data || jsonb_build_object('isAdmin', admin)
	WHERE
		email = user_email;
end
$$;


-- Performance is really bad as an admin user using RLS due to auth.is_admin() check being
-- enforced on every row rather than being treated as a constant...We don't want to
-- use IMMUTABLE function because of the dependency on current_setting, which is not immutable
-- even though empirically it works because this is security we are gonna be more cautious.
-- Will see if the supabase team has any ideas...
-- @see https://usevenice.slack.com/archives/C04NUANB7FW/p1680462683033239
CREATE OR REPLACE FUNCTION auth.is_admin()
    RETURNS boolean
    LANGUAGE sql
    STABLE
AS $function$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb #> '{app_metadata,isAdmin}' = 'true'::jsonb
$function$;

CREATE POLICY "admin_access" ON "public"."raw_commodity" USING (auth.is_admin());
CREATE POLICY "admin_access" ON "public"."raw_transaction" USING (auth.is_admin());
CREATE POLICY "admin_access" ON "public"."raw_account" USING (auth.is_admin());
CREATE POLICY "admin_access" ON "public"."institution" USING (auth.is_admin());

CREATE POLICY "admin_access" ON "public"."integration" USING (auth.is_admin());
CREATE POLICY "admin_access" ON "public"."resource" USING (auth.is_admin());
CREATE POLICY "admin_access" ON "public"."pipeline" USING (auth.is_admin());

CREATE POLICY "admin_access" ON "public"."_migrations" USING (auth.is_admin());

DO $$
BEGIN
  IF (SELECT to_regclass('auth.users') IS NOT null)
  THEN
    DROP INDEX IF EXISTS auth.users_api_key;
    CREATE INDEX IF NOT EXISTS users_api_key
    ON "auth"."users" ((raw_app_meta_data ->> 'apiKey'));
  END IF;
END $$
;

--- filename: 2023-04-04_0211_pgrest_pre_request.sql ---
-- Workaround for multiple RLS policies being slow when applied together.
-- TODO: Check if this approach works with supabase/realtime
-- @see https://usevenice.slack.com/archives/C04NUANB7FW/p1680566799056489?thread_ts=1680462683.033239&cid=C04NUANB7FW
CREATE OR REPLACE FUNCTION auth.pre_request() RETURNS void AS $$
  select set_config(
    'request.jwt.claim.resource_ids'
    , COALESCE((select jsonb_agg(id)::text from "resource" where creator_id = auth.uid()), '[]')
    , true
  );
  select set_config(
    'request.jwt.claim.sub'
    , (current_setting('request.jwt.claims', true))::jsonb->>'sub'
    , true
  );
$$ LANGUAGE sql;

DO $$ BEGIN IF (SELECT to_regclass('auth.users') IS NOT null) THEN
  ALTER ROLE authenticator set pgrst.db_pre_request = 'auth.pre_request';
END IF; END $$;

NOTIFY pgrst, 'reload config';

CREATE or replace FUNCTION auth.resource_ids() RETURNS character varying[]
    LANGUAGE sql stable AS $$
  select
    case when nullif(current_setting('request.jwt.claim.resource_ids', true), '') is not null then
      ARRAY(select jsonb_array_elements_text(
        nullif(current_setting('request.jwt.claim.resource_ids', true), '')::jsonb
      ))
    else
      -- Fallback for when pre_request() hasn't been called yet for some reason, such as possibly
      -- in supabase/realtime
      ARRAY(select id from "resource" where creator_id = auth.uid())
    end;
$$;
;

--- filename: 2023-04-22_1503_add_end_user_id_remove_ledger_id.sql ---
-- Introduce the concept of end-user and remove the concept of ledger.
-- Pipelines should also have the concept of end-user-id for situations where
-- end user does not own either resource (e.g. postgres -> heron data)

/*
Checklist:
- [x] Rename creator_id to end_user_id on creator
  - [x] Update RLS policy names while we are at it
- [x] Stop using ledger_resource_id and use end_user_id in code
  - [x] Get rid of connectWith
- [x] Regenerate types
*/


ALTER TABLE "public"."resource" RENAME COLUMN "creator_id" TO "end_user_id";
ALTER POLICY creator_access ON public.resource RENAME TO end_user_access;
ALTER POLICY resource_creator_access ON public.pipeline RENAME TO end_user_access;
ALTER POLICY connection_creator_access ON public.institution RENAME TO end_user_access;

-- Gotta introduce end user id because
-- 1) resources metadata are not always stored in the same db as the data
-- 2) It's possible that the end user does not own the resource but still should have access to some of the data
--   2.1) Consider postgres -> heron data pipeline with an endUserId specified
ALTER TABLE "public"."raw_transaction" ADD COLUMN "end_user_id" varchar;
ALTER TABLE "public"."raw_account" ADD COLUMN "end_user_id" varchar;
ALTER TABLE "public"."raw_commodity" ADD COLUMN "end_user_id" varchar;

UPDATE "public"."raw_transaction" SET end_user_id = REPLACE(ledger_resource_id, 'reso_postgres_', '');
UPDATE "public"."raw_account" SET end_user_id = REPLACE(ledger_resource_id, 'reso_postgres_', '');
UPDATE "public"."raw_commodity" SET end_user_id = REPLACE(ledger_resource_id, 'reso_postgres_', '');

DROP POLICY IF EXISTS ledger_resource_creator_access on public.raw_transaction;
CREATE POLICY end_user_access ON public.raw_transaction
  USING (end_user_id = auth.uid())
  WITH CHECK (end_user_id = auth.uid());

DROP POLICY IF EXISTS ledger_resource_creator_access on public.raw_account;
CREATE POLICY end_user_access ON public.raw_account
  USING (end_user_id = auth.uid())
  WITH CHECK (end_user_id = auth.uid());

DROP POLICY IF EXISTS ledger_resource_creator_access on public.raw_commodity;
CREATE POLICY end_user_access ON public.raw_commodity
  USING (end_user_id = auth.uid())
  WITH CHECK (end_user_id = auth.uid());

-- WARNING: Will need to rerun 2023-01-07_create-views.sql manually due to dependecy on ledger_resource_id
ALTER TABLE "public"."raw_transaction" DROP COLUMN "ledger_resource_id" CASCADE;
ALTER TABLE "public"."raw_account" DROP COLUMN "ledger_resource_id" CASCADE;
ALTER TABLE "public"."raw_commodity" DROP COLUMN "ledger_resource_id" CASCADE;

-- Update references which were previously missed

CREATE OR REPLACE FUNCTION auth.pre_request() RETURNS void AS $$
  select set_config(
    'request.jwt.claim.resource_ids'
    , COALESCE((select jsonb_agg(id)::text from "resource" where end_user_id = auth.uid()), '[]')
    , true
  );
  select set_config(
    'request.jwt.claim.sub'
    , (current_setting('request.jwt.claims', true))::jsonb->>'sub'
    , true
  );
$$ LANGUAGE sql;

CREATE or replace FUNCTION auth.resource_ids() RETURNS character varying[]
    LANGUAGE sql stable AS $$
  select
    case when nullif(current_setting('request.jwt.claim.resource_ids', true), '') is not null then
      ARRAY(select jsonb_array_elements_text(
        nullif(current_setting('request.jwt.claim.resource_ids', true), '')::jsonb
      ))
    else
      -- Fallback for when pre_request() hasn't been called yet for some reason, such as possibly
      -- in supabase/realtime
      ARRAY(select id from "resource" where end_user_id = auth.uid())
    end;
$$;

CREATE OR REPLACE FUNCTION auth.institution_ids() RETURNS character varying[]
    LANGUAGE sql STABLE
    AS $$
  select array(
    SELECT DISTINCT institution_id FROM "resource"
    WHERE end_user_id = auth.uid() AND institution_id IS NOT NULL
  )
$$;

ALTER INDEX resource_creator_id RENAME TO resource_end_user_id;


-- For debugging
-- SELECT tablename, policyname, qual, with_check FROM pg_policies WHERE schemaname = 'public' ;
;

--- filename: 2023-04-23_0735_default_id_prefix.sql ---
ALTER TABLE public.institution
  ALTER COLUMN id SET DEFAULT concat('ins_', public.generate_ulid()),
  ADD CONSTRAINT institution_id_prefix_check CHECK (starts_with(id, 'ins_'));
ALTER TABLE public.integration
  ALTER COLUMN id SET DEFAULT concat('int_', public.generate_ulid()),
  ADD CONSTRAINT integration_id_prefix_check CHECK (starts_with(id, 'int_'));
ALTER TABLE public.resource
  ALTER COLUMN id SET DEFAULT concat('reso', public.generate_ulid()),
  ADD CONSTRAINT resource_id_prefix_check CHECK (starts_with(id, 'reso'));
ALTER TABLE public.pipeline
  ALTER COLUMN id SET DEFAULT concat('pipe_', public.generate_ulid()),
  ADD CONSTRAINT pipeline_id_prefix_check CHECK (starts_with(id, 'pipe_'));
ALTER TABLE public.raw_transaction
  ALTER COLUMN id SET DEFAULT concat('txn_', public.generate_ulid()),
  ADD CONSTRAINT raw_transaction_id_prefix_check CHECK (starts_with(id, 'txn_'));
ALTER TABLE public.raw_account
  ALTER COLUMN id SET DEFAULT concat('acct_', public.generate_ulid()),
  ADD CONSTRAINT raw_account_id_prefix_check CHECK (starts_with(id, 'acct_'));
ALTER TABLE public.raw_commodity
  ALTER COLUMN id SET DEFAULT concat('comm_', public.generate_ulid()),
  ADD CONSTRAINT raw_commodity_id_prefix_check CHECK (starts_with(id, 'comm_'));

;

--- filename: 2023-04-23_0753_materialized_cte_over_pre_request.sql ---

DROP POLICY IF EXISTS end_user_access ON public.resource;
CREATE POLICY end_user_access ON public.resource
  USING ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ))
  WITH CHECK ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ));


DROP POLICY IF EXISTS end_user_access ON public.pipeline;
CREATE POLICY end_user_access ON "public"."pipeline"
  USING ((
    with cached as MATERIALIZED(
      select id as resource_id from resource where end_user_id = auth.uid()
    )
    -- Prevent user from seeing pipelines that don't have a source or destination that they have access to
    select array(select resource_id from cached) @> array[source_id, destination_id]
  ))
  WITH CHECK ((
    with cached as MATERIALIZED(
      select id as resource_id from resource where end_user_id = auth.uid()
    )
    -- Prevent user from creating/updating pipelines that don't have a source or destination that they have access to
    select array(select resource_id from cached) @> array[source_id, destination_id]
  ));

DROP POLICY IF EXISTS end_user_access ON public.institution;
CREATE POLICY public_readonly_access ON "public"."institution" FOR SELECT USING (true);

-- Getting rid of pre-request and extraneous functions

DO $$ BEGIN IF (SELECT to_regclass('auth.users') IS NOT null) THEN
  ALTER ROLE authenticator RESET pgrst.db_pre_request;
END IF; END $$;
NOTIFY pgrst, 'reload config';

DROP FUNCTION IF EXISTS auth.pre_request;
DROP FUNCTION IF EXISTS auth.resource_ids;
DROP FUNCTION IF EXISTS auth.institution_ids;

-- Won't need these for too long, but still

CREATE INDEX transaction_end_user_id ON raw_transaction (end_user_id);
CREATE INDEX account_end_user_id ON raw_account (end_user_id);
CREATE INDEX commodity_end_user_id ON raw_commodity (end_user_id);

DROP POLICY IF EXISTS end_user_access ON public.raw_transaction;
CREATE POLICY end_user_access ON public.raw_transaction
  USING ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ))
  WITH CHECK ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ));

DROP POLICY IF EXISTS end_user_access ON public.raw_account;
CREATE POLICY end_user_access ON public.raw_account
  USING ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ))
  WITH CHECK ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ));


DROP POLICY IF EXISTS end_user_access ON public.raw_commodity;
CREATE POLICY end_user_access ON public.raw_commodity
  USING ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ))
  WITH CHECK ((
    with cached as MATERIALIZED(select auth.uid())
    select end_user_id = uid from cached
  ));


;

--- filename: 2023-04-29_1549_multi_tenant.sql ---
-- 2024-04-26_0646 The has of this migration file has changed though semantically should not have changed
-- Therefore will have to repair the hash of this migration

--- Clean up previous ---

DROP POLICY IF EXISTS admin_access ON raw_transaction;
DROP POLICY IF EXISTS admin_access ON raw_commodity;
DROP POLICY IF EXISTS admin_access ON raw_account;
DROP POLICY IF EXISTS admin_access ON institution;
DROP POLICY IF EXISTS admin_access ON integration;
DROP POLICY IF EXISTS admin_access ON resource;
DROP POLICY IF EXISTS admin_access ON pipeline;
DROP POLICY IF EXISTS admin_access ON _migrations;

DROP FUNCTION IF EXISTS auth.is_admin;
DROP PROCEDURE IF EXISTS auth.set_user_admin;


DROP TABLE IF EXISTS public.workspace CASCADE;
DROP TABLE IF EXISTS public.workspace_member CASCADE;
DROP FUNCTION IF EXISTS auth.workspace_ids CASCADE;
DROP FUNCTION IF EXISTS auth.user_workspace_ids CASCADE;

-- Not dropping the previous tables yet, but we will start iwht policies
DROP POLICY IF EXISTS end_user_access ON raw_account;
DROP POLICY IF EXISTS end_user_access ON raw_commodity;
DROP POLICY IF EXISTS end_user_access ON raw_transaction;

-- Introduce org_id finally --

ALTER TABLE "public"."integration" ADD COLUMN org_id varchar NOT NULL;
CREATE INDEX IF NOT EXISTS integration_org_id ON "public"."integration" (org_id);
ALTER TABLE "public"."integration" ADD COLUMN display_name varchar;
ALTER TABLE "public"."integration" ADD COLUMN end_user_access boolean;

--- New helper functions that no longer depend on auth

-- Even this is hardly used, can basically drop auth.uid as we don't use it

CREATE OR REPLACE FUNCTION jwt_sub() RETURNS varchar LANGUAGE sql STABLE
AS $function$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )
$function$;

CREATE OR REPLACE FUNCTION jwt_org_id() RETURNS varchar LANGUAGE sql STABLE
AS $function$
  select coalesce(
    nullif(current_setting('request.jwt.claim.org_id', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'org_id')
  )
$function$;

CREATE OR REPLACE FUNCTION jwt_end_user_id() RETURNS varchar LANGUAGE sql STABLE
AS $function$
  select coalesce(
    nullif(current_setting('request.jwt.claim.end_user_id', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'end_user_id')
  )
$function$;

--- User policies ---

DO
$do$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'authenticated') THEN
      RAISE NOTICE 'Role "authenticated" already exists. Skipping.';
   ELSE
      -- We should probably stop depending on objects built into the supabase schema at some point
      -- For now we do this for the test environment
      CREATE ROLE "authenticated" WITH PASSWORD 'thex0hDD123b1!';
      CREATE ROLE "authenticator" WITH PASSWORD 'thex0hDD123b1!';
      GRANT "authenticated" TO CURRENT_USER; -- "postgres"; -- CURRENT_USER
      GRANT "authenticated" TO "authenticator";
      GRANT USAGE ON SCHEMA public TO "authenticated";
   END IF;
END
$do$;

DROP POLICY IF EXISTS org_member_access ON public.integration;
CREATE POLICY org_member_access ON "public"."integration" TO authenticated
  USING (org_id = jwt_org_id())
  WITH CHECK (org_id = jwt_org_id());

DROP POLICY IF EXISTS org_member_access ON public.resource;
CREATE POLICY org_member_access ON "public"."resource" TO authenticated
  USING (integration_id = ANY(
    select id from integration where org_id = jwt_org_id()
  ))
  WITH CHECK (integration_id = ANY(
    select id from integration where org_id = jwt_org_id()
  ));

DROP POLICY IF EXISTS org_member_access ON public.pipeline;
CREATE POLICY org_member_access ON "public"."pipeline" TO authenticated
  USING (
    array(
      select r.id
      from resource r
      join integration i on i.id = r.integration_id
      where i.org_id = jwt_org_id()
    ) && array[source_id, destination_id]
    -- && and @> is the same, however we are using && to stay consistent with end user policy
  )
  WITH CHECK (
    array(
      select r.id
      from resource r
      join integration i on i.id = r.integration_id
      where i.org_id = jwt_org_id()
    ) @> array[source_id, destination_id]
    -- User must have access to both the source & destination resources
  );


--- End user policies ---

CREATE ROLE "end_user" with PASSWORD 'thex0hDD123b1!';-- Irrelevant pw work around neon, no login allowed
GRANT "end_user" TO CURRENT_USER; -- "postgres" -- CURRENT_USER
GRANT "end_user" TO "authenticator";
GRANT USAGE ON SCHEMA public TO "end_user";

GRANT SELECT ON public.institution TO "end_user";
GRANT SELECT (id, org_id) ON public.integration TO "end_user";
DROP POLICY IF EXISTS end_user_access ON public.integration;
CREATE POLICY end_user_access ON public.integration TO end_user
  USING (org_id = jwt_org_id() AND end_user_access = true);


GRANT SELECT, UPDATE (display_name), DELETE ON public.resource TO "end_user";
DROP POLICY IF EXISTS end_user_access ON public.resource;
CREATE POLICY end_user_access ON public.resource TO end_user
  USING (
    integration_id = ANY(
      select id from integration
      where org_id = jwt_org_id()
    )
    AND end_user_id = (select jwt_end_user_id())
  );

-- REVOKE DELETE ON public.pipeline FROM "end_user";
GRANT SELECT ON public.pipeline TO "end_user";
DROP POLICY IF EXISTS end_user_access ON public.pipeline;
CREATE POLICY end_user_access ON public.pipeline TO end_user
  USING ((
    select array(
      select id
      from resource
      where integration_id = ANY(
        select id from integration
        where org_id = jwt_org_id()
      )
        AND end_user_id = (select jwt_end_user_id())
    ) && array[source_id, destination_id]
  -- User can see any pipeline that they their resource is connected to for the moment
  ));

--- Organization policies ---

CREATE ROLE "org" WITH PASSWORD 'thex0hDD123b1!'; -- Irrelevant pw, no login allowed
GRANT "org" TO CURRENT_USER; --  "postgres"; -- CURRENT_USER
GRANT "end_user" TO "authenticator";
GRANT USAGE ON SCHEMA public TO "org";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "org";

DROP POLICY IF EXISTS org_access ON public.integration;
CREATE POLICY org_access ON public.integration TO org
  USING (org_id = jwt_org_id())
  WITH CHECK (org_id = jwt_org_id());

DROP POLICY IF EXISTS org_access ON public.resource;
CREATE POLICY org_access ON public.resource TO org
  USING (integration_id = ANY(
      select id from integration
      where org_id = jwt_org_id()
  ))
  WITH CHECK (integration_id = ANY(
      select id from integration
      where org_id = jwt_org_id()
  ));

DROP POLICY IF EXISTS org_access ON public.pipeline;
CREATE POLICY org_access ON public.pipeline TO org
  USING ((
    select array(
      select r.id
      from resource r
      join integration i on r.integration_id = i.id
      where i.org_id = jwt_org_id()
    ) && array[source_id, destination_id]
    -- && and @> is the same, however we are using && to stay consistent with end user policy
  ))
  WITH CHECK ((
    select array(
      select r.id
      from resource r
      join integration i on r.integration_id = i.id
      where i.org_id = jwt_org_id()
    ) @> array[source_id, destination_id]
    -- Pipeline must be fully within the org
  ));

-- FiXME: Revoke write access to institution once we figure out a better way...
-- It's not YET an issue because we are not issuing any org-role tokens at the moment
GRANT INSERT, UPDATE ON public.institution TO "org";
DROP POLICY IF EXISTS org_write_access ON public.institution;
CREATE POLICY org_write_access ON "public"."institution" FOR ALL
  USING (true) WITH CHECK (true);

-- @see https://www.postgresql.org/docs/current/sql-createpolicy.html for docs

--- Migrating previous DATA

--  ALTER TABLE "public"."resource" ALTER COLUMN integration_id SET NOT NULL;
--  ALTER TABLE "public"."pipeline" ALTER COLUMN source_id SET NOT NULL;
--  ALTER TABLE "public"."pipeline" ALTER COLUMN destination_id SET NOT NULL;



;

--- filename: 2023-05-22_2146_migrate_plaid_config.sql ---
-- For debugging --

SELECT
  *
FROM
  integration;

SELECT
  *
FROM
  integration
WHERE
  config -> 'secrets' -> 'sandbox' IS NOT NULL;

SELECT
--     i.id,
    concat('int_plaid_',generate_ulid()),
    i.org_id,
    i.display_name,
    i.end_user_access,
    (i.config - 'secrets') || jsonb_build_object ('clientSecret',
      s.value,
      'envName',
      s.key) AS newconfig
--     s.key,
--     s.value
  FROM
    integration i,
    LATERAL jsonb_each(i.config -> 'secrets'::text) s (KEY,
      value)
  WHERE
    i.provider_name = 'plaid' and s.key != 'sandbox';

-- For reals --

INSERT INTO integration (id, org_id, display_name, end_user_access, config)
SELECT
  concat('int_plaid_', generate_ulid ()),
  i.org_id,
  i.display_name,
  i.end_user_access,
  (i.config - 'secrets') || jsonb_build_object ('clientSecret',
    s.value,
    'envName',
    s.key)
FROM
  integration i,
  LATERAL jsonb_each(i.config -> 'secrets'::text) s (KEY,
    value)
WHERE
  i.provider_name = 'plaid' and s.key != 'sandbox';

UPDATE
  integration
SET
  config = (config - 'secrets') || jsonb_build_object ('clientSecret',
    config -> 'secrets' -> 'sandbox',
    'envName',
    'sandbox')
    where config->'secrets'->'sandbox' is not null;;

--- filename: 2023-10-23_0313_integration_env_name.sql ---
ALTER TABLE integration ADD COLUMN env_name varchar
  GENERATED ALWAYS AS (config ->> 'envName') STORED;

GRANT SELECT(env_name, display_name) ON TABLE public.integration TO end_user;
;

--- filename: 2023-10-29_2125_integration_provider_name_grant.sql ---
GRANT SELECT(provider_name) ON TABLE public.integration TO end_user;
;

--- filename: 2023-11-14_0109_pipeline_disabled.sql ---
ALTER TABLE pipeline ADD disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE resource ADD disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE integration ADD disabled BOOLEAN DEFAULT FALSE;
;

--- filename: 2023-11-20_1923_connector_name.sql ---
ALTER TABLE institution RENAME COLUMN provider_name TO connector_name;
ALTER TABLE integration RENAME COLUMN provider_name TO connector_name;
ALTER TABLE resource RENAME COLUMN provider_name TO connector_name;
;

--- filename: 2023-11-21_0821_integration_to_connector_config.sql ---

-- Unrelated

ALTER TABLE resource DROP CONSTRAINT fk_institution_id;
ALTER TABLE resource
  ADD CONSTRAINT "fk_institution_id" FOREIGN KEY ("institution_id")
    REFERENCES "public"."institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop constraints rename and re-add constraints

ALTER TABLE resource DROP CONSTRAINT fk_integration_id;
ALTER TABLE integration DROP CONSTRAINT integration_id_prefix_check;

ALTER TABLE integration RENAME TO connector_config;
ALTER TABLE resource RENAME COLUMN integration_id TO connector_config_id;

ALTER TABLE resource
  ADD CONSTRAINT "fk_connector_config_id" FOREIGN KEY ("connector_config_id")
  REFERENCES "public"."connector_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE connector_config set id = REPLACE(id, 'int_', 'ccfg_');
ALTER TABLE connector_config
  ALTER COLUMN id SET DEFAULT concat('ccfg_', public.generate_ulid()),
  ADD CONSTRAINT connector_config_id_prefix_check CHECK (starts_with(id, 'ccfg_'));
;

--- filename: 2023-11-21_0934_institution_to_integration.sql ---
ALTER TABLE resource DROP CONSTRAINT fk_institution_id;
ALTER TABLE institution DROP CONSTRAINT institution_id_prefix_check;

ALTER TABLE institution RENAME TO integration;
ALTER TABLE resource RENAME COLUMN institution_id TO integration_id;

ALTER TABLE resource
  ADD CONSTRAINT "fk_integration_id" FOREIGN KEY ("integration_id")
  REFERENCES "public"."integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE integration set id = CONCAT('int_', SUBSTRING(id, LENGTH('ins_') + 1));
ALTER TABLE integration
  ALTER COLUMN id SET DEFAULT concat('int_', public.generate_ulid()),
  ADD CONSTRAINT integration_id_prefix_check CHECK (starts_with(id, 'int_'));
;

--- filename: 2023-11-24_0008_connector_config_src_dest.sql ---
ALTER TABLE connector_config ADD COLUMN default_destination_id varchar
  GENERATED ALWAYS AS (config ->> 'default_destination_id') STORED;
ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_destination_id" FOREIGN KEY ("default_destination_id")
  REFERENCES "public"."resource"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE connector_config ADD COLUMN default_source_id varchar
  GENERATED ALWAYS AS (config ->> 'default_source_id') STORED;
ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_source_id" FOREIGN KEY ("default_source_id")
  REFERENCES "public"."resource"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
;

--- filename: 2023-11-25_0545_connector_config_src_dest_top_level.sql ---
ALTER TABLE connector_config DROP CONSTRAINT "fk_default_source_id";
ALTER TABLE connector_config DROP CONSTRAINT "fk_default_destination_id";
ALTER TABLE connector_config DROP COLUMN default_source_id;
ALTER TABLE connector_config DROP COLUMN default_destination_id;

ALTER TABLE connector_config ADD COLUMN default_destination_id varchar;
ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_destination_id" FOREIGN KEY ("default_destination_id")
  REFERENCES "public"."resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE connector_config ADD COLUMN default_source_id varchar;
ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_source_id" FOREIGN KEY ("default_source_id")
  REFERENCES "public"."resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;


;

--- filename: 2023-11-25_0836_connector_config_incoming_outgoing.sql ---
ALTER TABLE connector_config DROP CONSTRAINT "fk_default_source_id";
ALTER TABLE connector_config DROP CONSTRAINT "fk_default_destination_id";
ALTER TABLE connector_config DROP COLUMN default_source_id;
ALTER TABLE connector_config DROP COLUMN default_destination_id;

ALTER TABLE connector_config ADD COLUMN default_pipe_out jsonb;
ALTER TABLE connector_config ADD COLUMN default_pipe_in jsonb;

ALTER TABLE connector_config ADD COLUMN default_pipe_out_destination_id varchar
  GENERATED ALWAYS AS (default_pipe_out ->> 'destination_id') STORED;
ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_pipe_out_destination_id" FOREIGN KEY ("default_pipe_out_destination_id")
  REFERENCES "public"."resource"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE connector_config ADD COLUMN default_pipe_in_source_id varchar
  GENERATED ALWAYS AS (default_pipe_in ->> 'source_id') STORED;
ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_pipe_in_source_id" FOREIGN KEY ("default_pipe_in_source_id")
  REFERENCES "public"."resource"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
;

--- filename: 2023-11-30_2212_add_metadata.sql ---
ALTER TABLE connector_config ADD COLUMN metadata jsonb;
ALTER TABLE resource ADD COLUMN metadata jsonb;
ALTER TABLE pipeline ADD COLUMN metadata jsonb;
;

--- filename: 2023-11-30_2310_drop_end_user_access.sql ---
DROP POLICY IF EXISTS end_user_access ON public.connector_config;
CREATE POLICY end_user_access ON public.connector_config TO end_user
  USING (org_id = jwt_org_id());

ALTER TABLE connector_config DROP COLUMN end_user_access;
;

--- filename: 2024-04-26_0614_add_pipeline_streams.sql ---
ALTER TABLE pipeline ADD COLUMN streams jsonb;
;

--- filename: 2024-04-26_0645_drop_data_tables.sql ---
DROP TABLE IF EXISTS raw_account;
DROP TABLE IF EXISTS raw_commodity;
DROP TABLE IF EXISTS raw_transaction;
;

--- filename: 2024-04-26_0746_neon_fix.sql ---
-- Get the logic working for neon which does not come with a lot of Supabase features

DO
$do$
BEGIN
-- Surround in a check so that this migration does not fail in a vanilla postgres instance
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'anon') THEN
      create role anon with PASSWORD 'thex0hDD123b1!';
      grant anon, authenticated to CURRENT_USER; -- CURRENT_USER

      GRANT USAGE ON SCHEMA public TO "authenticated";
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "authenticated";
   ELSE
      RAISE NOTICE 'Role "anon" exists. Skipping grant.';
   END IF;
END
$do$;

create or replace procedure auth.login_as (role_name text, sub text)
    language plpgsql
    as $$
declare
    auth_user record;
begin
    execute format('set request.jwt.claim.sub=%L', sub);
    execute format('set request.jwt.claim.role=%I', role_name);

    -- https://share.cleanshot.com/9Yrd6Zsg Not sure why we are getting this, temp workaround
    -- raise notice '%', format('set role %I; -- logging in as %L (%L)', auth_user.role, auth_user.id, auth_user.email);
    raise notice 'set role as %', role_name;

    execute format('set role %I', role_name);
end
$$;


create or replace procedure auth.login_as_user (sub text, org_id text)
    language plpgsql
    as $$
declare
    auth_user record;
begin
    call auth.login_as('authenticated', sub);
    execute format('set request.jwt.claim.org_id=%L', org_id);
end
$$;


create or replace procedure auth.login_as_end_user (sub text, org_id text)
    language plpgsql
    as $$
declare
    auth_user record;
begin
    call auth.login_as('end_user', sub);
    execute format('set request.jwt.claim.org_id=%L', org_id);
end
$$;


create or replace procedure auth.login_as_org (sub text)
    language plpgsql
    as $$
declare
    auth_user record;
begin
    call auth.login_as('org', sub);
end
$$;


;

--- filename: 2024-04-27_0445_pipeline_vertical.sql ---
ALTER TABLE pipeline ADD COLUMN source_vertical varchar;
ALTER TABLE pipeline ADD COLUMN destination_vertical varchar;
;

--- filename: 2024-09-26_1612_connector_config_disabled.sql ---
GRANT SELECT(disabled) ON TABLE public.connector_config TO end_user;
;

--- filename: 2024-12-08_1648_end_user_to_customer.sql ---
ALTER ROLE end_user RENAME TO customer;


ALTER POLICY end_user_access ON public.connector_config RENAME TO customer_access;
ALTER POLICY end_user_access ON public.pipeline RENAME TO customer_access;
ALTER POLICY end_user_access ON public.resource RENAME TO customer_access;


-- 2. Rename the function
ALTER FUNCTION public.jwt_end_user_id RENAME TO jwt_customer_id;

-- 3. Rename column in resource table
ALTER TABLE public.resource RENAME COLUMN end_user_id TO customer_id;

-- 4. Rename index
ALTER INDEX resource_end_user_id RENAME TO resource_customer_id;


CREATE OR REPLACE FUNCTION jwt_customer_id() RETURNS varchar LANGUAGE sql STABLE
AS $function$
  select coalesce(
    nullif(current_setting('request.jwt.claim.customer_id', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'customer_id')
  )
$function$;

DROP POLICY IF EXISTS customer_access ON public.resource;
CREATE POLICY customer_access ON public.resource TO customer
  USING (
    connector_config_id = ANY(
      select id from connector_config
      where org_id = jwt_org_id()
    )
    AND customer_id = (select jwt_customer_id())
  );

DROP POLICY IF EXISTS customer_access ON public.pipeline;
CREATE POLICY customer_access ON public.pipeline TO customer
  USING ((
    select array(
      select id
      from resource
      where connector_config_id = ANY(
        select id from connector_config
        where org_id = jwt_org_id()
      )
        AND customer_id = (select jwt_customer_id())
    ) && array[source_id, destination_id]
  -- User can see any pipeline that they their resource is connected to for the moment
  ));;

--- filename: 2024-12-08_1731_resource_to_connection.sql ---
-- Rename the table
ALTER TABLE public.resource RENAME TO connection;

-- Rename the primary key constraint
ALTER INDEX public.pk_resource RENAME TO pk_connection;

-- Rename the id prefix check constraint
-- Update the default value for the id column to use 'conn' prefix instead of 'reso'
ALTER TABLE public.connection ALTER COLUMN id SET DEFAULT concat('conn_', public.generate_ulid());
ALTER TABLE public.connection DROP CONSTRAINT resource_id_prefix_check;
ALTER TABLE public.connector_config DROP CONSTRAINT fk_default_pipe_in_source_id;
ALTER TABLE public.connector_config DROP CONSTRAINT fk_default_pipe_out_destination_id;

-- Update existing IDs - only replace prefix
UPDATE public.connection SET id = 'conn_' || substring(id from 6) WHERE id LIKE 'reso_%';
-- Manually cascading the changes to the related tables because automatic cascading is not supported for generated columns
UPDATE public.connector_config
SET
  default_pipe_out = CASE
    WHEN default_pipe_out->>'destination_id' LIKE 'reso_%'
    THEN jsonb_set(
      default_pipe_out,
      '{destination_id}',
      to_jsonb(
        REPLACE(
          default_pipe_out->>'destination_id',
          'reso_',
          'conn_'
        )
      )
    )
    ELSE default_pipe_out
  END,
  default_pipe_in = CASE
    WHEN default_pipe_in->>'source_id' LIKE 'reso_%'
    THEN jsonb_set(
      default_pipe_in,
      '{source_id}',
      to_jsonb(
        REPLACE(
          default_pipe_in->>'source_id',
          'reso_',
          'conn_'
        )
      )
    )
    ELSE default_pipe_in
  END
WHERE
  default_pipe_out->>'destination_id' LIKE 'reso_%'
  OR default_pipe_in->>'source_id' LIKE 'reso_%';
ALTER TABLE public.connection ADD CONSTRAINT connection_id_prefix_check CHECK (starts_with((id)::text, 'conn_'::text));
ALTER TABLE public.connector_config
  ADD CONSTRAINT fk_default_pipe_in_source_id
  FOREIGN KEY (default_pipe_in_source_id)
  REFERENCES public.connection(id)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

ALTER TABLE public.connector_config
  ADD CONSTRAINT fk_default_pipe_out_destination_id
  FOREIGN KEY (default_pipe_out_destination_id)
  REFERENCES public.connection(id)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

-- Rename indexes
ALTER INDEX public.resource_created_at RENAME TO connection_created_at;
ALTER INDEX public.resource_customer_id RENAME TO connection_customer_id;
ALTER INDEX public.resource_provider_name RENAME TO connection_provider_name;
ALTER INDEX public.resource_updated_at RENAME TO connection_updated_at;

-- Drop existing policies
DROP POLICY IF EXISTS customer_access ON public.connection;
DROP POLICY IF EXISTS org_access ON public.connection;
DROP POLICY IF EXISTS org_member_access ON public.connection;

-- Recreate policies with new table name
CREATE POLICY customer_access ON public.connection TO customer
USING (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
  AND customer_id = (SELECT public.jwt_customer_id())
);

CREATE POLICY org_access ON public.connection TO org
USING (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
) WITH CHECK (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
);

CREATE POLICY org_member_access ON public.connection TO authenticated
USING (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
) WITH CHECK (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
);


COMMIT;
