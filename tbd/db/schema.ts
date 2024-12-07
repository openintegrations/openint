import {sql} from 'drizzle-orm'
import {customType, index, pgSchema, pgTable} from 'drizzle-orm/pg-core'
import {env} from '@openint/env'
import type {ErrorType} from '@openint/vdk'

/**
 * WARNING: expression is not escaped and not safe for dynamic table construction from user input!
 */
const generated = <T = undefined>(
  name: string,
  dataType: string,
  expr: string,
) =>
  customType<{
    data: T
    driverData: undefined
    default: true
    notNull: true
  }>({
    // TODO: This doesn't actually work, @see
    // https://discord.com/channels/1043890932593987624/1156712008893354084/1209669640637382739
    // however it is still useful to leave it here so migration can produce semi-correct SQL
    dataType() {
      if (env['DEBUG']) {
        console.debug(
          'Please manually modify the migration to add the generated column',
          `${name} ${dataType} GENERATED ALWAYS AS (${expr}) STORED`,
        )
      }
      return dataType
    },
  })(name)

const schema = env['POSTGRES_SCHEMA'] ? pgSchema(env['POSTGRES_SCHEMA']) : null

const tableFn = (schema?.table ?? pgTable) as typeof pgTable

/** Not currently used. Maybe better to have customer rather than end_user? */
export const customer = tableFn('customer', (t) => ({
  // Standard cols
  id: t
    .text()
    .notNull()
    .primaryKey()
    .default(sql`substr(md5(random()::text), 0, 25)`),
  created_at: t
    .timestamp({
      precision: 3,
      mode: 'string',
    })
    .notNull()
    .defaultNow(),
  updated_at: t
    .timestamp({
      precision: 3,
      mode: 'string',
    })
    .notNull()
    .defaultNow(),

  // Specific cols
  name: t.text(),
  email: t.text(),
}))

/** Aka sync execution or sync log  */
export const sync_run = tableFn(
  'sync_run',
  (t) => ({
    // Standard cols
    id: t
      .text()
      .notNull()
      .primaryKey()
      .default(sql`substr(md5(random()::text), 0, 25)`),
    created_at: t.timestamp({precision: 3, mode: 'string'}).defaultNow(),
    updated_at: t.timestamp({precision: 3, mode: 'string'}).defaultNow(),
    // Identifying cols
    input_event: t.jsonb().notNull(),
    // Data columns
    started_at: t.timestamp({precision: 3, mode: 'string'}),
    completed_at: t.timestamp({precision: 3, mode: 'string'}),
    duration: generated('duration', 'interval', 'completed_at - started_at'),

    initial_state: t.jsonb(),
    final_state: t.jsonb(),
    metrics: t.jsonb(),
    status: generated<'PENDING' | 'SUCCESS' | ErrorType>(
      'status',
      'varchar',
      "CASE WHEN error_type IS NOT NULL THEN error_type WHEN completed_at IS NOT NULL THEN 'SUCCESS' ELSE 'PENDING' END",
    ),

    resource_id: generated(
      'resource_id',
      'varchar',
      "input_event#>>'{data,resource_id}'",
    ),
    error_detail: t.text(),
    /** zErrorType. But we don't want to use postgres enum */
    error_type: t.varchar(),
  }),
  (table) => [index('idx_resource_id').on(table.resource_id)],
)

export const sync_state = tableFn('sync_state', (t) => ({
  resource_id: t.text().primaryKey(),
  state: t.jsonb(),
  created_at: t.timestamp({precision: 3, mode: 'string'}).defaultNow(),
  updated_at: t.timestamp({precision: 3, mode: 'string'}).defaultNow(),
}))
