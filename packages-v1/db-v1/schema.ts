import {sql} from 'drizzle-orm'
import {index, pgTable, timestamp} from 'drizzle-orm/pg-core'
import type {Id} from '@openint/util-v1'
import {makeId} from '@openint/util-v1'

// Needs to be create a new timestamp each time to avoid implicit drizzle caching issues
// that would cause updated_at to be the same as created_at
const timestampField = () =>
  timestamp({withTimezone: true, mode: 'string'})
    .notNull()
    .default(sql`now()`)

export const organization = pgTable(
  'organization',
  (t) => ({
    id: t
      .varchar()
      .primaryKey()
      .$defaultFn(() => makeId('org'))
      .$type<Id['org']>(),
    name: t.varchar().notNull(),
    api_key: t.varchar().notNull(),
    created_at: timestampField(),
    updated_at: timestampField(),
  }),
  () => [],
)

export const connector_config = pgTable(
  'connector_config',
  (t) => ({
    id: t
      .varchar()
      .primaryKey()
      .$defaultFn(() => makeId('ccfg'))
      .$type<Id['ccfg']>(),

    org_id: t.varchar().notNull(),
    created_at: timestampField(),
    updated_at: timestampField(),
    connector_name: t
      .varchar()
      .notNull()
      .generatedAlwaysAs(sql`nullif(split_part(id, '_', 2), '')`),
    config: t.jsonb(),
  }),
  (table) => [index().on(table.org_id)],
)

export const integration = pgTable(
  'integration',
  (t) => ({
    id: t
      .varchar()
      .primaryKey()
      .$defaultFn(() => makeId('int'))
      .$type<Id['int']>(),
    connector_config_id: t.varchar().notNull(),
    connector_name: t
      .varchar()
      .notNull()
      .generatedAlwaysAs(
        sql`nullif(split_part(connector_config_id, '_', 2), '')`,
      ),
    name: t.varchar().notNull(),
    logo_url: t.varchar(),
    remote_data: t.jsonb(),
    created_at: timestampField(),
    updated_at: timestampField(),
  }),
  () => [],
)

export const connection = pgTable(
  'connection',
  (t) => ({
    id: t
      .varchar()
      .primaryKey()
      .$defaultFn(() => makeId('conn'))
      .$type<Id['conn']>(),
    connector_config_id: t.varchar().notNull(),
    connector_name: t
      .varchar()
      .notNull()
      .generatedAlwaysAs(
        sql`nullif(split_part(connector_config_id, '_', 2), '')`,
      ),
    settings: t.jsonb(),
    integration_id: t.varchar().notNull(),
    customer_id: t.varchar().notNull(),
    remote_data: t.jsonb(),
    created_at: timestampField(),
    updated_at: timestampField(),
  }),
  () => [],
)

export default {
  organization,
  connector_config,
  integration,
  connection,
}
