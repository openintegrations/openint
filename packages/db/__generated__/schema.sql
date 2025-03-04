--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: generate_ulid(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_ulid() RETURNS text
    LANGUAGE plpgsql
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
$$;


--
-- Name: jwt_customer_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_customer_id() RETURNS character varying
    LANGUAGE sql STABLE
    AS $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.customer_id', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'customer_id')
  )
$$;


--
-- Name: jwt_org_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_org_id() RETURNS character varying
    LANGUAGE sql STABLE
    AS $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.org_id', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'org_id')
  )
$$;


--
-- Name: jwt_sub(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_sub() RETURNS character varying
    LANGUAGE sql STABLE
    AS $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint,
    created_at_timestamp timestamp without time zone GENERATED ALWAYS AS (to_timestamp(((created_at / 1000))::double precision)) STORED
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.__drizzle_migrations_id_seq OWNED BY public.__drizzle_migrations.id;


--
-- Name: connection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connection (
    id character varying DEFAULT concat('conn_', public.generate_ulid()) NOT NULL,
    connector_name character varying GENERATED ALWAYS AS (split_part((id)::text, '_'::text, 2)) STORED NOT NULL,
    customer_id character varying,
    connector_config_id character varying,
    integration_id character varying,
    env_name character varying,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    display_name character varying,
    disabled boolean DEFAULT false,
    metadata jsonb,
    CONSTRAINT connection_id_prefix_check CHECK (starts_with((id)::text, 'conn_'::text))
);


--
-- Name: connector_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connector_config (
    id character varying DEFAULT concat('ccfg_', public.generate_ulid()) NOT NULL,
    connector_name character varying GENERATED ALWAYS AS (split_part((id)::text, '_'::text, 2)) STORED NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    org_id character varying NOT NULL,
    display_name character varying,
    env_name character varying GENERATED ALWAYS AS ((config ->> 'envName'::text)) STORED,
    disabled boolean DEFAULT false,
    default_pipe_out jsonb,
    default_pipe_in jsonb,
    default_pipe_out_destination_id character varying GENERATED ALWAYS AS ((default_pipe_out ->> 'destination_id'::text)) STORED,
    default_pipe_in_source_id character varying GENERATED ALWAYS AS ((default_pipe_in ->> 'source_id'::text)) STORED,
    metadata jsonb,
    CONSTRAINT connector_config_id_prefix_check CHECK (starts_with((id)::text, 'ccfg_'::text))
);


--
-- Name: event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event (
    id character varying DEFAULT 'concat(''evt_'', generate_ulid())'::character varying NOT NULL,
    name character varying NOT NULL,
    data jsonb NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    "user" jsonb,
    v character varying,
    org_id character varying GENERATED ALWAYS AS (("user" ->> 'org_id'::text)) STORED,
    user_id character varying GENERATED ALWAYS AS (("user" ->> 'user_id'::text)) STORED,
    customer_id character varying GENERATED ALWAYS AS (("user" ->> 'customer_id'::text)) STORED,
    CONSTRAINT event_id_prefix_check CHECK (starts_with((id)::text, 'evt_'::text))
);


--
-- Name: integration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration (
    id character varying DEFAULT concat('int_', public.generate_ulid()) NOT NULL,
    connector_name character varying GENERATED ALWAYS AS (split_part((id)::text, '_'::text, 2)) STORED NOT NULL,
    standard jsonb DEFAULT '{}'::jsonb NOT NULL,
    external jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT integration_id_prefix_check CHECK (starts_with((id)::text, 'int_'::text))
);


--
-- Name: pipeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pipeline (
    id character varying DEFAULT concat('pipe_', public.generate_ulid()) NOT NULL,
    source_id character varying,
    source_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    destination_id character varying,
    destination_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    link_options jsonb DEFAULT '[]'::jsonb NOT NULL,
    last_sync_started_at timestamp with time zone,
    last_sync_completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    disabled boolean DEFAULT false,
    metadata jsonb,
    streams jsonb,
    source_vertical character varying,
    destination_vertical character varying,
    CONSTRAINT pipeline_id_prefix_check CHECK (starts_with((id)::text, 'pipe_'::text))
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('public.__drizzle_migrations_id_seq'::regclass);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: connection pk_connection; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connection
    ADD CONSTRAINT pk_connection PRIMARY KEY (id);


--
-- Name: integration pk_institution; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT pk_institution PRIMARY KEY (id);


--
-- Name: connector_config pk_integration; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connector_config
    ADD CONSTRAINT pk_integration PRIMARY KEY (id);


--
-- Name: pipeline pk_pipeline; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipeline
    ADD CONSTRAINT pk_pipeline PRIMARY KEY (id);


--
-- Name: connection_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connection_created_at ON public.connection USING btree (created_at);


--
-- Name: connection_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connection_customer_id ON public.connection USING btree (customer_id);


--
-- Name: connection_provider_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connection_provider_name ON public.connection USING btree (connector_name);


--
-- Name: connection_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX connection_updated_at ON public.connection USING btree (updated_at);


--
-- Name: event_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_customer_id ON public.event USING btree (customer_id);


--
-- Name: event_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_org_id ON public.event USING btree (org_id);


--
-- Name: event_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_timestamp ON public.event USING btree ("timestamp");


--
-- Name: event_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_user_id ON public.event USING btree (user_id);


--
-- Name: institution_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX institution_created_at ON public.integration USING btree (created_at);


--
-- Name: institution_provider_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX institution_provider_name ON public.integration USING btree (connector_name);


--
-- Name: institution_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX institution_updated_at ON public.integration USING btree (updated_at);


--
-- Name: integration_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX integration_created_at ON public.connector_config USING btree (created_at);


--
-- Name: integration_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX integration_org_id ON public.connector_config USING btree (org_id);


--
-- Name: integration_provider_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX integration_provider_name ON public.connector_config USING btree (connector_name);


--
-- Name: integration_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX integration_updated_at ON public.connector_config USING btree (updated_at);


--
-- Name: pipeline_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pipeline_created_at ON public.pipeline USING btree (created_at);


--
-- Name: pipeline_destination_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pipeline_destination_id ON public.pipeline USING btree (destination_id);


--
-- Name: pipeline_source_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pipeline_source_id ON public.pipeline USING btree (source_id);


--
-- Name: pipeline_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pipeline_updated_at ON public.pipeline USING btree (updated_at);


--
-- Name: connection fk_connector_config_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connection
    ADD CONSTRAINT fk_connector_config_id FOREIGN KEY (connector_config_id) REFERENCES public.connector_config(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: connector_config fk_default_pipe_in_source_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connector_config
    ADD CONSTRAINT fk_default_pipe_in_source_id FOREIGN KEY (default_pipe_in_source_id) REFERENCES public.connection(id) ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;


--
-- Name: connector_config fk_default_pipe_out_destination_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connector_config
    ADD CONSTRAINT fk_default_pipe_out_destination_id FOREIGN KEY (default_pipe_out_destination_id) REFERENCES public.connection(id) ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;


--
-- Name: pipeline fk_destination_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipeline
    ADD CONSTRAINT fk_destination_id FOREIGN KEY (destination_id) REFERENCES public.connection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CONSTRAINT fk_destination_id ON pipeline; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT fk_destination_id ON public.pipeline IS '@graphql({"foreign_name": "destination", "local_name": "destinationOfPipelines"})';


--
-- Name: connection fk_integration_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connection
    ADD CONSTRAINT fk_integration_id FOREIGN KEY (integration_id) REFERENCES public.integration(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pipeline fk_source_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipeline
    ADD CONSTRAINT fk_source_id FOREIGN KEY (source_id) REFERENCES public.connection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CONSTRAINT fk_source_id ON pipeline; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT fk_source_id ON public.pipeline IS '@graphql({"foreign_name": "source", "local_name": "sourceOfPipelines"})';


--
-- Name: connection; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connection ENABLE ROW LEVEL SECURITY;

--
-- Name: connector_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connector_config ENABLE ROW LEVEL SECURITY;

--
-- Name: connection customer_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_access ON public.connection TO customer USING ((((connector_config_id)::text IN ( SELECT connector_config.id
   FROM public.connector_config
  WHERE ((connector_config.org_id)::text = (public.jwt_org_id())::text))) AND ((customer_id)::text = (( SELECT public.jwt_customer_id() AS jwt_customer_id))::text)));


--
-- Name: connector_config customer_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_access ON public.connector_config TO customer USING (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: pipeline customer_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_access ON public.pipeline TO customer USING (( SELECT (ARRAY( SELECT connection.id
           FROM public.connection
          WHERE (((connection.connector_config_id)::text IN ( SELECT connector_config.id
                   FROM public.connector_config
                  WHERE ((connector_config.org_id)::text = (public.jwt_org_id())::text))) AND ((connection.customer_id)::text = (( SELECT public.jwt_customer_id() AS jwt_customer_id))::text))) && ARRAY[pipeline.source_id, pipeline.destination_id])));


--
-- Name: event customer_append; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_append ON public.event FOR INSERT TO customer WITH CHECK (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: event customer_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_read ON public.event FOR SELECT TO customer USING (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: event; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;

--
-- Name: integration; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.integration ENABLE ROW LEVEL SECURITY;

--
-- Name: connection org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_access ON public.connection TO org USING (((connector_config_id)::text IN ( SELECT connector_config.id
   FROM public.connector_config
  WHERE ((connector_config.org_id)::text = (public.jwt_org_id())::text)))) WITH CHECK (((connector_config_id)::text IN ( SELECT connector_config.id
   FROM public.connector_config
  WHERE ((connector_config.org_id)::text = (public.jwt_org_id())::text))));


--
-- Name: connector_config org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_access ON public.connector_config TO org USING (((org_id)::text = (public.jwt_org_id())::text)) WITH CHECK (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: pipeline org_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_access ON public.pipeline TO org USING (( SELECT (ARRAY( SELECT r.id
           FROM (public.connection r
             JOIN public.connector_config i ON (((r.connector_config_id)::text = (i.id)::text)))
          WHERE ((i.org_id)::text = (public.jwt_org_id())::text)) && ARRAY[pipeline.source_id, pipeline.destination_id]))) WITH CHECK (( SELECT (ARRAY( SELECT r.id
           FROM (public.connection r
             JOIN public.connector_config i ON (((r.connector_config_id)::text = (i.id)::text)))
          WHERE ((i.org_id)::text = (public.jwt_org_id())::text)) @> ARRAY[pipeline.source_id, pipeline.destination_id])));


--
-- Name: event org_append; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_append ON public.event FOR INSERT TO org WITH CHECK (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: connection org_member_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_member_access ON public.connection TO authenticated USING (((connector_config_id)::text IN ( SELECT connector_config.id
   FROM public.connector_config
  WHERE ((connector_config.org_id)::text = (public.jwt_org_id())::text)))) WITH CHECK (((connector_config_id)::text IN ( SELECT connector_config.id
   FROM public.connector_config
  WHERE ((connector_config.org_id)::text = (public.jwt_org_id())::text))));


--
-- Name: connector_config org_member_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_member_access ON public.connector_config TO authenticated USING (((org_id)::text = (public.jwt_org_id())::text)) WITH CHECK (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: pipeline org_member_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_member_access ON public.pipeline TO authenticated USING ((ARRAY( SELECT r.id
   FROM (public.connection r
     JOIN public.connector_config i ON (((i.id)::text = (r.connector_config_id)::text)))
  WHERE ((i.org_id)::text = (public.jwt_org_id())::text)) && ARRAY[source_id, destination_id])) WITH CHECK ((ARRAY( SELECT r.id
   FROM (public.connection r
     JOIN public.connector_config i ON (((i.id)::text = (r.connector_config_id)::text)))
  WHERE ((i.org_id)::text = (public.jwt_org_id())::text)) @> ARRAY[source_id, destination_id]));


--
-- Name: event org_member_append; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_member_append ON public.event FOR INSERT TO authenticated WITH CHECK (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: event org_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_member_read ON public.event FOR SELECT TO authenticated USING (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: event org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.event FOR SELECT TO org USING (((org_id)::text = (public.jwt_org_id())::text));


--
-- Name: integration org_write_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_write_access ON public.integration USING (true) WITH CHECK (true);


--
-- Name: pipeline; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pipeline ENABLE ROW LEVEL SECURITY;

--
-- Name: integration public_readonly_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_readonly_access ON public.integration FOR SELECT USING (true);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO customer;
GRANT USAGE ON SCHEMA public TO org;


--
-- Name: TABLE __drizzle_migrations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.__drizzle_migrations TO org;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.__drizzle_migrations TO authenticated;


--
-- Name: TABLE connection; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,DELETE ON TABLE public.connection TO customer;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.connection TO org;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.connection TO authenticated;


--
-- Name: COLUMN connection.display_name; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(display_name) ON TABLE public.connection TO customer;


--
-- Name: TABLE connector_config; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.connector_config TO org;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.connector_config TO authenticated;


--
-- Name: COLUMN connector_config.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.connector_config TO customer;


--
-- Name: COLUMN connector_config.connector_name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(connector_name) ON TABLE public.connector_config TO customer;


--
-- Name: COLUMN connector_config.org_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(org_id) ON TABLE public.connector_config TO customer;


--
-- Name: COLUMN connector_config.display_name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(display_name) ON TABLE public.connector_config TO customer;


--
-- Name: COLUMN connector_config.env_name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(env_name) ON TABLE public.connector_config TO customer;


--
-- Name: COLUMN connector_config.disabled; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(disabled) ON TABLE public.connector_config TO customer;


--
-- Name: TABLE event; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.event TO customer;
GRANT SELECT ON TABLE public.event TO org;
GRANT SELECT ON TABLE public.event TO authenticated;


--
-- Name: TABLE integration; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.integration TO customer;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.integration TO org;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.integration TO authenticated;


--
-- Name: TABLE pipeline; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.pipeline TO customer;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pipeline TO org;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pipeline TO authenticated;


--
-- PostgreSQL database dump complete
--

