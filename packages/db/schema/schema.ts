import {sql} from 'drizzle-orm'
import {
  boolean,
  check,
  foreignKey,
  index,
  jsonb,
  pgPolicy,
  pgRole,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import type {ConnectorName} from '@openint/all-connectors/name'

export const orgRole = pgRole('org')
export const customerRole = pgRole('customer')
export const userRole = pgRole('authenticated')

// TODO: Missing jwt_org_id() function definition

export const connection = pgTable(
  // NOTE: shouldn't this have a status or should it calculated based on settings?
  'connection',
  {
    id: varchar()
      .default("concat('conn_', generate_ulid())")
      .primaryKey()
      .notNull(),
    connector_name: varchar()
      .notNull()
      .$type<ConnectorName>()
      .generatedAlwaysAs(sql`split_part((id)::text, '_'::text, 2)`),
    customer_id: varchar(),
    connector_config_id: varchar().notNull(),
    integration_id: varchar(),
    /** @deprecated Not sure if we want this */
    env_name: varchar(),
    settings: jsonb().default({}).notNull().$type<any>(),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    display_name: varchar(),
    disabled: boolean().default(false),
    metadata: jsonb().$type<any>(),
  },
  (t) => [
    index('connection_created_at').on(t.created_at),
    index('connection_customer_id').on(t.customer_id),
    index('connection_provider_name').on(t.connector_name),
    index('connection_updated_at').on(t.updated_at),
    check('connection_id_prefix_check', sql`starts_with(id, 'conn_')`),
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
      to: 'authenticated',
      using: sql`(
        connector_config_id IN (
          SELECT connector_config.id
          FROM public.connector_config
          WHERE connector_config.org_id = public.jwt_org_id()
        )
      )`,
      withCheck: sql`(
        connector_config_id IN (
          SELECT connector_config.id
          FROM public.connector_config
          WHERE connector_config.org_id = public.jwt_org_id()
        )
      )`,
    }),
    pgPolicy('org_access', {
      to: 'org',
      using: sql`(
        connector_config_id IN (
          SELECT connector_config.id
          FROM public.connector_config
          WHERE connector_config.org_id = public.jwt_org_id()
        )
      )`,
      withCheck: sql`(
        connector_config_id IN (
          SELECT connector_config.id
          FROM public.connector_config
          WHERE connector_config.org_id = public.jwt_org_id()
        )
      )`,
    }),
    pgPolicy('customer_access', {
      to: 'customer',
      using: sql`(
        connector_config_id IN (
          SELECT connector_config.id
          FROM public.connector_config
          WHERE connector_config.org_id = public.jwt_org_id()
        )
        AND customer_id = (SELECT public.jwt_customer_id())
      )`,
    }),
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
    source_state: jsonb().$type<any>().default({}).notNull(),
    destination_id: varchar(),
    destination_state: jsonb().$type<any>().default({}).notNull(),
    /** @deprecated Not used in prod despite field existing... */
    link_options: jsonb().$type<any>().default([]).notNull(),
    last_sync_started_at: timestamp({withTimezone: true, mode: 'string'}),
    last_sync_completed_at: timestamp({withTimezone: true, mode: 'string'}),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    disabled: boolean().default(false),
    metadata: jsonb().$type<any>(),
    streams: jsonb().$type<any>(),
    source_vertical: varchar(),
    destination_vertical: varchar(),
  },
  (table) => [
    index('pipeline_created_at').on(table.created_at),
    index('pipeline_destination_id').on(table.destination_id),
    index('pipeline_source_id').on(table.source_id),
    index('pipeline_updated_at').on(table.updated_at),
    check('pipeline_id_prefix_check', sql`starts_with(id, 'pipe_')`),
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
      to: 'customer',
      using: sql`(
        SELECT array(
          SELECT id
          FROM connection
          WHERE
            connector_config_id = ANY(
              SELECT id
              FROM connector_config
              WHERE org_id = jwt_org_id()
            )
            AND customer_id = (SELECT jwt_customer_id())
        ) && array[pipeline.source_id, pipeline.destination_id]
      )`,
    }),
    pgPolicy('org_access', {
      to: 'org',
      using: sql`(
        SELECT array(
          SELECT r.id
          FROM resource r
          JOIN connector_config cc on r.connector_config_id = cc.id
          WHERE cc.org_id = jwt_org_id()
        ) && array[source_id, destination_id]
        -- && and @> is the same, however we are using && to stay consistent with end user policy
      )`,
      withCheck: sql`(
        select array(
          select r.id
          from resource r
          join connector_config cc on r.connector_config_id = cc.id
          where cc.org_id = jwt_org_id()
        ) @> array[source_id, destination_id]
        -- Pipeline must be fully within the org
      )`,
    }),
    pgPolicy('org_member_access', {
      to: 'authenticated',
      using: sql`(
        array(
          select r.id
          from resource r
          join connector_config cc on cc.id = r.connector_config_id
          where cc.org_id = jwt_org_id()
        ) && array[source_id, destination_id]
        -- && and @> is the same, however we are using && to stay consistent with end user policy
      )`,
      withCheck: sql`(
        array(
          select r.id
          from resource r
          join connector_config cc on cc.id = r.connector_config_id
          where cc.org_id = jwt_org_id()
        ) @> array[source_id, destination_id]
        -- User must have access to both the source & destination resources
      )`,
    }),
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
      .$type<ConnectorName>()
      .generatedAlwaysAs(sql`split_part((id)::text, '_'::text, 2)`),
    standard: jsonb().$type<any>().default({}).notNull(),
    external: jsonb().$type<any>().default({}).notNull(),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('institution_created_at').on(table.created_at),
    index('institution_provider_name').on(table.connector_name),
    index('institution_updated_at').on(table.updated_at),
    check('integration_id_prefix_check', sql`starts_with(id, 'int_')`),
    // -- FiXME: Revoke write access to institution once we figure out a better way...
    // -- It's not YET an issue because we are not issuing any org-role tokens at the moment
    pgPolicy('org_write_access', {
      to: 'public',
      using: sql`true`,
      withCheck: sql`true`,
    }),
    pgPolicy('public_readonly_access', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
  ],
)

/** Workaround for the circular reference issue between connector_config and connection otherwise... */
const _connection: any = connection

export const connector_config = pgTable(
  'connector_config',
  {
    id: varchar()
      .default("concat('ccfg_', generate_ulid())")
      .primaryKey()
      .notNull(),
    connector_name: varchar()
      .notNull()
      .$type<ConnectorName>()
      .generatedAlwaysAs(sql`split_part((id)::text, '_'::text, 2)`),
    config: jsonb().$type<any>().default({}).notNull(),
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
    default_pipe_out: jsonb().$type<any>(),
    default_pipe_in: jsonb().$type<any>(),
    default_pipe_out_destination_id: varchar().generatedAlwaysAs(
      sql`(default_pipe_out ->> 'destination_id'::text)`,
    ),
    default_pipe_in_source_id: varchar().generatedAlwaysAs(
      sql`(default_pipe_in ->> 'source_id'::text)`,
    ),
    metadata: jsonb().$type<any>(),
  },
  (table) => [
    index('integration_created_at').on(table.created_at),
    index('integration_org_id').on(table.org_id),
    index('integration_provider_name').on(table.connector_name),
    index('integration_updated_at').on(table.updated_at),
    foreignKey({
      columns: [table.default_pipe_in_source_id],
      foreignColumns: [_connection.id],
      name: 'fk_default_pipe_in_source_id',
    }) // deferred, but not supported in drizzle https://github.com/drizzle-team/drizzle-orm/issues/1429
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.default_pipe_out_destination_id],
      foreignColumns: [_connection.id],
      name: 'fk_default_pipe_out_destination_id',
    }) // deferred, but not supported in drizzle https://github.com/drizzle-team/drizzle-orm/issues/1429
      .onUpdate('restrict')
      .onDelete('restrict'),
    check('connector_config_id_prefix_check', sql`starts_with(id, 'ccfg_')`),
    pgPolicy('org_access', {
      to: 'org',
      using: sql`org_id = jwt_org_id()`,
      withCheck: sql`org_id = jwt_org_id()`,
    }),
    pgPolicy('customer_access', {
      to: 'customer',
      using: sql`org_id = public.jwt_org_id()`,
    }),
    pgPolicy('org_member_access', {
      to: 'authenticated',
      using: sql`org_id = public.jwt_org_id()`,
      withCheck: sql`org_id = public.jwt_org_id()`,
    }),
  ],
)

/** https://www.inngest.com/docs/features/events-triggers/event-format */
export const event = pgTable(
  'event',
  {
    id: varchar()
      .default("concat('evt_', generate_ulid())")
      .primaryKey()
      .notNull(),
    name: varchar().notNull(),
    data: jsonb().notNull().$type<any>(),
    timestamp: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    user: jsonb().$type<any>(),
    v: varchar(),

    /**
     * optional metadata contained inside `user` field, should probably be generated
     * Will be used for RLS policies
     * Slightly inconsistent given that user_id and customer_id are not abbreviated
     */
    org_id: varchar().generatedAlwaysAs(sql`"user"->>'org_id'`), // organization_id
    user_id: varchar().generatedAlwaysAs(sql`"user"->>'user_id'`), // user_id
    customer_id: varchar().generatedAlwaysAs(
      // TODO: remove this once we have a migration to fix the data
      sql`COALESCE("user"->>'cus_id', "user"->>'customer_id')`,
    ), // customer_id
  },
  (table) => [
    index('event_timestamp').on(table.timestamp),
    index('event_org_id').on(table.org_id),
    index('event_user_id').on(table.user_id),
    index('event_customer_id').on(table.customer_id),
    check('event_id_prefix_check', sql`starts_with(id, 'evt_')`),
    pgPolicy('org_read', {
      to: 'org',
      for: 'select',
      using: sql`org_id = jwt_org_id()`,
    }),
    pgPolicy('org_member_read', {
      to: 'authenticated',
      for: 'select',
      using: sql`org_id = public.jwt_org_id()`,
    }),
    pgPolicy('customer_read', {
      to: 'customer',
      for: 'select',
      using: sql`org_id = public.jwt_org_id()`,
    }),
    pgPolicy('org_append', {
      to: 'org',
      for: 'insert',
      withCheck: sql`org_id = jwt_org_id()`,
    }),
    pgPolicy('org_member_append', {
      to: 'authenticated',
      for: 'insert',
      withCheck: sql`org_id = public.jwt_org_id()`,
    }),
    pgPolicy('customer_append', {
      to: 'customer',
      for: 'insert',
      withCheck: sql`org_id = public.jwt_org_id()`,
    }),
  ],
)

export const organization = pgTable(
  'organization',
  {
    id: varchar()
      .default("concat('org_', generate_ulid())")
      .primaryKey()
      .notNull(),
    api_key: varchar().unique(),
    name: varchar(),
    slug: varchar(),
    metadata: jsonb().$type<any>(),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy('org_read', {
      to: 'org',
      for: 'select',
      using: sql`id = jwt_org_id()`,
    }),
    pgPolicy('org_member_read', {
      to: 'authenticated',
      for: 'select',
      using: sql`id = jwt_org_id()`,
    }),
  ],
)

export const customer = pgTable(
  'customer',
  {
    org_id: varchar()
      .notNull()
      .references(() => organization.id),
    id: varchar().default("concat('cus_', generate_ulid())").notNull(),
    metadata: jsonb().$type<any>(),
    created_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
    updated_at: timestamp({withTimezone: true, mode: 'string'})
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({columns: [t.org_id, t.id]}),
    pgPolicy('org_access', {
      to: 'org',
      using: sql`org_id = jwt_org_id()`,
      withCheck: sql`org_id = jwt_org_id()`,
    }),
    pgPolicy('org_member_access', {
      to: 'authenticated',
      using: sql`org_id = jwt_org_id()`,
      withCheck: sql`org_id = jwt_org_id()`,
    }),
    pgPolicy('customer_read', {
      to: 'customer',
      using: sql`org_id = jwt_org_id() AND id = jwt_customer_id()`,
    }),
  ],
)
