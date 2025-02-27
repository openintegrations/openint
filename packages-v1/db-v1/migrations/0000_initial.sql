CREATE TABLE "connection" (
	"id" varchar PRIMARY KEY NOT NULL,
	"connector_config_id" varchar NOT NULL,
	"connector_name" varchar GENERATED ALWAYS AS (nullif(split_part(connector_config_id, '_', 2), '')) STORED NOT NULL,
	"settings" jsonb,
	"integration_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"remote_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connector_config" (
	"id" varchar PRIMARY KEY NOT NULL,
	"org_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"connector_name" varchar GENERATED ALWAYS AS (nullif(split_part(id, '_', 2), '')) STORED NOT NULL,
	"config" jsonb
);
--> statement-breakpoint
CREATE TABLE "integration" (
	"id" varchar PRIMARY KEY NOT NULL,
	"connector_config_id" varchar NOT NULL,
	"connector_name" varchar GENERATED ALWAYS AS (nullif(split_part(connector_config_id, '_', 2), '')) STORED NOT NULL,
	"name" varchar NOT NULL,
	"logo_url" varchar,
	"remote_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"api_key" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "connector_config_org_id_index" ON "connector_config" USING btree ("org_id");