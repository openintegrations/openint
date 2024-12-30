CREATE TABLE "event" (
  "id" varchar PRIMARY KEY DEFAULT 'concat(''evt_'', generate_ulid())' NOT NULL,
  "name" varchar NOT NULL,
  "data" jsonb NOT NULL,
  "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
  "user" jsonb,
  "v" varchar,
  "org_id" varchar,
  "usr_id" varchar,
  "cus_id" varchar,
  CONSTRAINT "event_id_prefix_check" CHECK (starts_with(id, 'evt_'))
);

--> statement-breakpoint
ALTER TABLE
  "event" ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint
CREATE INDEX "event_timestamp" ON "event" USING btree ("timestamp");

--> statement-breakpoint
CREATE INDEX "event_org_id" ON "event" USING btree ("org_id");

--> statement-breakpoint
CREATE INDEX "event_usr_id" ON "event" USING btree ("usr_id");

--> statement-breakpoint
CREATE INDEX "event_cus_id" ON "event" USING btree ("cus_id");

--> statement-breakpoint
CREATE POLICY "org_read" ON "event" AS PERMISSIVE FOR
SELECT
  TO "org" USING (org_id = jwt_org_id());

--> statement-breakpoint
CREATE POLICY "org_member_read" ON "event" AS PERMISSIVE FOR
SELECT
  TO "authenticated" USING (org_id = public.jwt_org_id());

--> statement-breakpoint
CREATE POLICY "customer_read" ON "event" AS PERMISSIVE FOR
SELECT
  TO "customer" USING (org_id = public.jwt_org_id());

--> statement-breakpoint
CREATE POLICY "org_append" ON "event" AS PERMISSIVE FOR
INSERT
  TO "org" WITH CHECK (org_id = jwt_org_id());

--> statement-breakpoint
CREATE POLICY "org_member_append" ON "event" AS PERMISSIVE FOR
INSERT
  TO "authenticated" WITH CHECK (org_id = public.jwt_org_id());

--> statement-breakpoint
CREATE POLICY "customer_append" ON "event" AS PERMISSIVE FOR
INSERT
  TO "customer" WITH CHECK (org_id = public.jwt_org_id());
