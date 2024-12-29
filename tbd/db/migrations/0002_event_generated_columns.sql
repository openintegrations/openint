-- Drop the indices
DROP INDEX IF EXISTS "event_org_id";
DROP INDEX IF EXISTS "event_usr_id";
DROP INDEX IF EXISTS "event_cus_id";

-- Drop the policies
DROP POLICY IF EXISTS "org_read" ON "event";
DROP POLICY IF EXISTS "org_member_read" ON "event";
DROP POLICY IF EXISTS "customer_read" ON "event";
DROP POLICY IF EXISTS "org_append" ON "event";
DROP POLICY IF EXISTS "org_member_append" ON "event";
DROP POLICY IF EXISTS "customer_append" ON "event";

ALTER TABLE "event" drop column "org_id";--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "org_id" varchar GENERATED ALWAYS AS ("user"->>'org_id') STORED;--> statement-breakpoint
ALTER TABLE "event" drop column "usr_id";--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "user_id" varchar GENERATED ALWAYS AS ("user"->>'user_id') STORED;--> statement-breakpoint
ALTER TABLE "event" drop column "cus_id";--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "customer_id" varchar GENERATED ALWAYS AS ("user"->>'customer_id') STORED;

--> statement-breakpoint
CREATE INDEX "event_org_id" ON "event" USING btree ("org_id");

--> statement-breakpoint
CREATE INDEX "event_user_id" ON "event" USING btree ("user_id");

--> statement-breakpoint
CREATE INDEX "event_customer_id" ON "event" USING btree ("customer_id");

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
