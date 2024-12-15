import {sql} from 'drizzle-orm'
import {
  boolean,
  check,
  foreignKey,
  index,
  jsonb,
  pgPolicy,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const connection = pgTable(
  'connection',
  {

    id: varchar()
      .default("concat('conn_', generate_ulid())")
      .primaryKey()
      .notNull(),
    connector_name: varchar()
      .notNull()
      .generatedAlwaysAs(sql`split_part((id)::text, '_'::text, 2)`),
    customer_id: varchar(),
    connector_config_id: varchar(),
    integration_id: varchar(),
    env_name: varchar(),
    settings: jsonb().default({}).notNull(),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    display_name: varchar(),
    disabled: boolean().default(false),
    metadata: jsonb(),
  },
  (t) => {
    return {
      created_at: index('connection_created_at').using(
        'btree',
        t.created_at.asc().nullsLast().op('timestamptz_ops'),
      ),
      customer_id: index('connection_customer_id').using(
        'btree',
        t.customer_id.asc().nullsLast().op('text_ops'),
      ),
      provider_name: index('connection_provider_name').using(
        'btree',
        t.connector_name.asc().nullsLast().op('text_ops'),
      ),
      updated_at: index('connection_updated_at').using(
        'btree',
        t.updated_at.asc().nullsLast().op('timestamptz_ops'),
      ),
      fk_connector_config_id: foreignKey({
        columns: [t.connector_config_id],
        foreignColumns: [connector_config.id],
        name: 'fk_connector_config_id',
      })
        .onUpdate('cascade')
        .onDelete('restrict'),
      fk_integration_id: foreignKey({
        columns: [t.integration_id],
        foreignColumns: [integration.id],
        name: 'fk_integration_id',
      })
        .onUpdate('cascade')
        .onDelete('restrict'),
      org_member_access: pgPolicy('org_member_access', {
        as: 'permissive',
        for: 'all',
        to: ['authenticated'],
        using: sql`((connector_config_id)::text IN ( SELECT connector_config.id
   FROM connector_config
  WHERE ((connector_config.org_id)::text = (jwt_org_id())::text)))`,
        withCheck: sql`((connector_config_id)::text IN ( SELECT connector_config.id
   FROM connector_config
  WHERE ((connector_config.org_id)::text = (jwt_org_id())::text)))`,
      }),
      org_access: pgPolicy('org_access', {
        as: 'permissive',
        for: 'all',
        to: ['org'],
      }),
      customer_access: pgPolicy('customer_access', {
        as: 'permissive',
        for: 'all',
        to: ['customer'],
      }),
      connection_id_prefix_check: check(
        'connection_id_prefix_check',
        sql`CHECK (starts_with((id)::text, 'conn_'::text`,
      ),
    }
  },
)

export const pipeline = pgTable(
  'pipeline',
  {
    id: varchar()
      .default("concat('pipe_', generate_ulid())")
      .primaryKey()
      .notNull(),
    source_id: varchar(),
    source_state: jsonb().default({}).notNull(),
    destination_id: varchar(),
    destination_state: jsonb().default({}).notNull(),
    link_options: jsonb().default([]).notNull(),
    last_sync_started_at: timestamp({withTimezone: true, mode: 'string'}),
    last_sync_completed_at: timestamp({withTimezone: true, mode: 'string'}),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    disabled: boolean().default(false),
    metadata: jsonb(),
    streams: jsonb(),
    source_vertical: varchar(),
    destination_vertical: varchar(),
  },
  (table) => {
    return {
      created_at: index('pipeline_created_at').using(
        'btree',
        table.created_at.asc().nullsLast().op('timestamptz_ops'),
      ),
      destination_id: index('pipeline_destination_id').using(
        'btree',
        table.destination_id.asc().nullsLast().op('text_ops'),
      ),
      source_id: index('pipeline_source_id').using(
        'btree',
        table.source_id.asc().nullsLast().op('text_ops'),
      ),
      updated_at: index('pipeline_updated_at').using(
        'btree',
        table.updated_at.asc().nullsLast().op('timestamptz_ops'),
      ),
      fk_destination_id: foreignKey({
        columns: [table.destination_id],
        foreignColumns: [connection.id],
        name: 'fk_destination_id',
      })
        .onUpdate('cascade')
        .onDelete('cascade'),
      fk_source_id: foreignKey({
        columns: [table.source_id],
        foreignColumns: [connection.id],
        name: 'fk_source_id',
      })
        .onUpdate('cascade')
        .onDelete('cascade'),
      customer_access: pgPolicy('customer_access', {
        as: 'permissive',
        for: 'all',
        to: ['customer'],
        using: sql`( SELECT (ARRAY( SELECT connection.id
           FROM connection
          WHERE (((connection.connector_config_id)::text IN ( SELECT connector_config.id
                   FROM connector_config
                  WHERE ((connector_config.org_id)::text = (jwt_org_id())::text))) AND ((connection.customer_id)::text = (( SELECT jwt_customer_id() AS jwt_customer_id))::text))) && ARRAY[pipeline.source_id, pipeline.destination_id]))`,
      }),
      org_access: pgPolicy('org_access', {
        as: 'permissive',
        for: 'all',
        to: ['org'],
      }),
      org_member_access: pgPolicy('org_member_access', {
        as: 'permissive',
        for: 'all',
        to: ['authenticated'],
      }),
      pipeline_id_prefix_check: check(
        'pipeline_id_prefix_check',
        sql`CHECK (starts_with((id)::text, 'pipe_'::text`,
      ),
    }
  },
)

export const integration = pgTable(
  'integration',
  {
    id: varchar()
      .default("concat('int_', generate_ulid())")
      .primaryKey()
      .notNull(),
    connector_name: varchar()
      .notNull()
      .generatedAlwaysAs(sql`split_part((id)::text, '_'::text, 2)`),
    standard: jsonb().default({}).notNull(),
    external: jsonb().default({}).notNull(),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      institution_created_at: index('institution_created_at').using(
        'btree',
        table.created_at.asc().nullsLast().op('timestamptz_ops'),
      ),
      institution_provider_name: index('institution_provider_name').using(
        'btree',
        table.connector_name.asc().nullsLast().op('text_ops'),
      ),
      institution_updated_at: index('institution_updated_at').using(
        'btree',
        table.updated_at.asc().nullsLast().op('timestamptz_ops'),
      ),
      org_write_access: pgPolicy('org_write_access', {
        as: 'permissive',
        for: 'all',
        to: ['public'],
        using: sql`true`,
        withCheck: sql`true`,
      }),
      public_readonly_access: pgPolicy('public_readonly_access', {
        as: 'permissive',
        for: 'select',
        to: ['public'],
      }),
      integration_id_prefix_check: check(
        'integration_id_prefix_check',
        sql`CHECK (starts_with((id)::text, 'int_'::text`,
      ),
    }
  },
)

export const connector_config = pgTable(
  'connector_config',
  {
    id: varchar()
      .default("concat('ccfg_', generate_ulid())")
      .primaryKey()
      .notNull(),
    connector_name: varchar()
      .notNull()
      .generatedAlwaysAs(sql`split_part((id)::text, '_'::text, 2)`),
    config: jsonb().default({}).notNull(),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    org_id: varchar().notNull(),
    display_name: varchar(),
    env_name: varchar().generatedAlwaysAs(sql`(config ->> 'envName'::text)`),
    disabled: boolean().default(false),
    default_pipe_out: jsonb(),
    default_pipe_in: jsonb(),
    default_pipe_out_destination_id: varchar().generatedAlwaysAs(
      sql`(default_pipe_out ->> 'destination_id'::text)`,
    ),
    default_pipe_in_source_id: varchar().generatedAlwaysAs(
      sql`(default_pipe_in ->> 'source_id'::text)`,
    ),
    metadata: jsonb(),
  },
  (table) => {
    return {
      integration_created_at: index('integration_created_at').using(
        'btree',
        table.created_at.asc().nullsLast().op('timestamptz_ops'),
      ),
      integration_org_id: index('integration_org_id').using(
        'btree',
        table.org_id.asc().nullsLast().op('text_ops'),
      ),
      integration_provider_name: index('integration_provider_name').using(
        'btree',
        table.connector_name.asc().nullsLast().op('text_ops'),
      ),
      integration_updated_at: index('integration_updated_at').using(
        'btree',
        table.updated_at.asc().nullsLast().op('timestamptz_ops'),
      ),

      org_access: pgPolicy('org_access', {
        as: 'permissive',
        for: 'all',
        to: ['org'],
        using: sql`((org_id)::text = (jwt_org_id())::text)`,
        withCheck: sql`((org_id)::text = (jwt_org_id())::text)`,
      }),
      customer_access: pgPolicy('customer_access', {
        as: 'permissive',
        for: 'all',
        to: ['customer'],
      }),
      org_member_access: pgPolicy('org_member_access', {
        as: 'permissive',
        for: 'all',
        to: ['authenticated'],
      }),
      connector_config_id_prefix_check: check(
        'connector_config_id_prefix_check',
        sql`CHECK (starts_with((id)::text, 'ccfg_'::text`,
      ),
      // causes circular dependency
      // fk_default_pipe_in_source_id: foreignKey({
      //   columns: [table.default_pipe_in_source_id],
      //   foreignColumns: [connection.id],
      //   name: 'fk_default_pipe_in_source_id',
      // })
      //   .onUpdate('restrict')
      //   .onDelete('restrict'),
      // fk_default_pipe_out_destination_id: foreignKey({
      //   columns: [table.default_pipe_out_destination_id],
      //   foreignColumns: [connection.id],
      //   name: 'fk_default_pipe_out_destination_id',
      // })
      //   .onUpdate('restrict')
      //   .onDelete('restrict'),
    }
  },
)
