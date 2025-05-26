ALTER TABLE "connection" ALTER COLUMN "id" SET DEFAULT concat('conn_', generate_ulid ());--> statement-breakpoint
ALTER TABLE "connector_config" ALTER COLUMN "id" SET DEFAULT concat('ccfg_', generate_ulid ());--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "id" SET DEFAULT concat('cus_', generate_ulid ());--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "id" SET DEFAULT concat('evt_', generate_ulid ());--> statement-breakpoint
ALTER TABLE "integration" ALTER COLUMN "id" SET DEFAULT concat('int_', generate_ulid ());--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "id" SET DEFAULT concat('org_', generate_ulid ());--> statement-breakpoint
ALTER TABLE "pipeline" ALTER COLUMN "id" SET DEFAULT concat('pipe_', generate_ulid ());--> statement-breakpoint

ALTER TABLE "customer" ADD COLUMN "api_key" varchar;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_api_key_unique" UNIQUE("api_key");--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."customer" TO "org"; --> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."customer" TO "authenticated"; --> statement-breakpoint
GRANT SELECT ON TABLE "public"."customer" TO "customer"; --> statement-breakpoint


-- Not sure why these were auto-generated. They should NOT be needed
-- ALTER POLICY "org_append" ON "event" TO org WITH CHECK (org_id = jwt_org_id ());--> statement-breakpoint
-- ALTER POLICY "org_member_append" ON "event" TO authenticated WITH CHECK (
--         org_id = public.jwt_org_id ()
--         AND user_id = public.jwt_sub ()
--       );--> statement-breakpoint
-- ALTER POLICY "customer_append" ON "event" TO customer WITH CHECK (
--         org_id = public.jwt_org_id ()
--         AND customer_id = public.jwt_customer_id ()
--       );