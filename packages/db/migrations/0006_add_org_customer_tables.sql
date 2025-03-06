CREATE TABLE "customer" (
	"org_id" varchar NOT NULL,
	"id" varchar DEFAULT 'concat(''cus_'', generate_ulid())' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_org_id_id_pk" PRIMARY KEY("org_id","id")
);
--> statement-breakpoint
ALTER TABLE "customer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization" (
	"id" varchar PRIMARY KEY DEFAULT 'concat(''org_'', generate_ulid())' NOT NULL,
	"api_key" varchar,
	"name" varchar,
	"slug" varchar,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "org_access" ON "customer" AS PERMISSIVE FOR ALL TO "org" USING (org_id = jwt_org_id()) WITH CHECK (org_id = jwt_org_id());--> statement-breakpoint
CREATE POLICY "org_member_access" ON "customer" AS PERMISSIVE FOR ALL TO "authenticated" USING (org_id = jwt_org_id()) WITH CHECK (org_id = jwt_org_id());--> statement-breakpoint
CREATE POLICY "customer_read" ON "customer" AS PERMISSIVE FOR ALL TO "customer" USING (org_id = jwt_org_id() AND id = jwt_customer_id());--> statement-breakpoint
CREATE POLICY "org_read" ON "organization" AS PERMISSIVE FOR SELECT TO "org" USING (id = jwt_org_id());--> statement-breakpoint
CREATE POLICY "org_member_read" ON "organization" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id = jwt_org_id());