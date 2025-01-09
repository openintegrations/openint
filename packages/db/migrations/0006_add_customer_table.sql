CREATE TABLE "customer" (
  -- QQ: make composite auto geneated of org_id and customer_id ?
  "id": DEFAULT 'concat(''cus'', generate_ulid())' NOT NULL,
  "customer_id" VARCHAR NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "org_id" VARCHAR NOT NULL,
  "metadata" jsonb NOT NULL,
  "default_destination_id": VARCHAR,
  -- ? 
  CONSTRAINT "customer_id_prefix_check" CHECK (starts_with(id, 'cus')),
  CONSTRAINT "pk_customer" PRIMARY KEY ("id", "org_id"),

  CONSTRAINT "fk_connection_id" FOREIGN KEY ("default_destination_id")
    REFERENCES "public"."connection"("id") ON DELETE RESTRICT
);

--> statement-breakpoint
ALTER TABLE
  "customer" ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint
CREATE INDEX "customer_created_at" ON "customer" USING btree ("created_at");
CREATE INDEX "customer_updated_at" ON "customer" USING btree ("updated_at");

--> statement-breakpoint
CREATE INDEX "customer_org_id" ON "customer" USING btree ("org_id");

-- QQ, add index on cus_id + org id?
--> statement-breakpoint
CREATE INDEX "customer_cus_id" ON "customer" USING btree ("cus_id");

--> statement-breakpoint
CREATE POLICY "org_read" ON "customer" AS PERMISSIVE FOR
SELECT
  TO "org" USING (org_id = jwt_org_id());

--> statement-breakpoint
CREATE POLICY "org_member_read" ON "customer" AS PERMISSIVE FOR
SELECT
  TO "authenticated" USING (org_id = public.jwt_org_id());

--> statement-breakpoint
CREATE POLICY "customer_read" ON "customer" AS PERMISSIVE FOR
SELECT
  TO "customer" USING (org_id = public.jwt_org_id());

--> statement-breakpoint
CREATE POLICY "org_append" ON "customer" AS PERMISSIVE FOR
INSERT
  TO "org" WITH CHECK (org_id = jwt_org_id());

--> statement-breakpoint
CREATE POLICY "org_member_append" ON "customer" AS PERMISSIVE FOR
INSERT
  TO "authenticated" WITH CHECK (org_id = public.jwt_org_id());

--> statement-breakpoint
CREATE POLICY "customer_append" ON "customer" AS PERMISSIVE FOR
INSERT
  TO "customer" WITH CHECK (org_id = public.jwt_org_id());
