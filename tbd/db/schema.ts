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
  (t) => [
    index('connection_created_at').using(
      'btree',
      t.created_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    index('connection_customer_id').using(
      'btree',
      t.customer_id.asc().nullsLast().op('text_ops'),
    ),
    index('connection_provider_name').using(
      'btree',
      t.connector_name.asc().nullsLast().op('text_ops'),
    ),
    index('connection_updated_at').using(
      'btree',
      t.updated_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    foreignKey({
      columns: [t.connector_config_id],
      foreignColumns: [connector_config.id],
      name: 'fk_connector_config_id',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [t.integration_id],
      foreignColumns: [integration.id],
      name: 'fk_integration_id',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    pgPolicy('org_member_access', {
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
    pgPolicy('org_access', {
      as: 'permissive',
      for: 'all',
      to: ['org'],
    }),
    pgPolicy('customer_access', {
      as: 'permissive',
      for: 'all',
      to: ['customer'],
    }),
    check(
      'connection_id_prefix_check',
      sql`CHECK (starts_with((id)::text, 'conn_'::text`,
    ),
  ],
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
  (table) => [
    index('pipeline_created_at').using(
      'btree',
      table.created_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    index('pipeline_destination_id').using(
      'btree',
      table.destination_id.asc().nullsLast().op('text_ops'),
    ),
    index('pipeline_source_id').using(
      'btree',
      table.source_id.asc().nullsLast().op('text_ops'),
    ),
    index('pipeline_updated_at').using(
      'btree',
      table.updated_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    foreignKey({
      columns: [table.destination_id],
      foreignColumns: [connection.id],
      name: 'fk_destination_id',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.source_id],
      foreignColumns: [connection.id],
      name: 'fk_source_id',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    pgPolicy('customer_access', {
      as: 'permissive',
      for: 'all',
      to: ['customer'],
      using: sql`( SELECT (ARRAY( SELECT connection.id
         FROM connection
        WHERE (((connection.connector_config_id)::text IN ( SELECT connector_config.id
                 FROM connector_config
                WHERE ((connector_config.org_id)::text = (jwt_org_id())::text))) AND ((connection.customer_id)::text = (( SELECT jwt_customer_id() AS jwt_customer_id))::text))) && ARRAY[pipeline.source_id, pipeline.destination_id]))`,
    }),
    pgPolicy('org_access', {
      as: 'permissive',
      for: 'all',
      to: ['org'],
    }),
    pgPolicy('org_member_access', {
      as: 'permissive',
      for: 'all',
      to: ['authenticated'],
    }),
    check(
      'pipeline_id_prefix_check',
      sql`CHECK (starts_with((id)::text, 'pipe_'::text`,
    ),
  ],
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
  (table) => [
    index('institution_created_at').using(
      'btree',
      table.created_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    index('institution_provider_name').using(
      'btree',
      table.connector_name.asc().nullsLast().op('text_ops'),
    ),
    index('institution_updated_at').using(
      'btree',
      table.updated_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    pgPolicy('org_write_access', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`true`,
      withCheck: sql`true`,
    }),
    pgPolicy('public_readonly_access', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
    }),
    check(
      'integration_id_prefix_check',
      sql`CHECK (starts_with((id)::text, 'int_'::text`,
    ),
  ],
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
  (table) => [
    index('integration_created_at').using(
      'btree',
      table.created_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    index('integration_org_id').using(
      'btree',
      table.org_id.asc().nullsLast().op('text_ops'),
    ),
    index('integration_provider_name').using(
      'btree',
      table.connector_name.asc().nullsLast().op('text_ops'),
    ),
    index('integration_updated_at').using(
      'btree',
      table.updated_at.asc().nullsLast().op('timestamptz_ops'),
    ),
    pgPolicy('org_access', {
      as: 'permissive',
      for: 'all',
      to: ['org'],
      using: sql`((org_id)::text = (jwt_org_id())::text)`,
      withCheck: sql`((org_id)::text = (jwt_org_id())::text)`,
    }),
    pgPolicy('customer_access', {
      as: 'permissive',
      for: 'all',
      to: ['customer'],
    }),
    pgPolicy('org_member_access', {
      as: 'permissive',
      for: 'all',
      to: ['authenticated'],
    }),
    check(
      'connector_config_id_prefix_check',
      sql`CHECK (starts_with((id)::text, 'ccfg_'::text`,
    ),
    // causes circular dependency
    // foreignKey({
    //   columns: [table.default_pipe_in_source_id],
    //   foreignColumns: [connection.id],
    //   name: 'fk_default_pipe_in_source_id',
    // })
    //   .onUpdate('restrict')
    //   .onDelete('restrict'),
    // foreignKey({
    //   columns: [table.default_pipe_out_destination_id],
    //   foreignColumns: [connection.id],
    //   name: 'fk_default_pipe_out_destination_id',
    // })
    //   .onUpdate('restrict')
    //   .onDelete('restrict'),
  ],
)
