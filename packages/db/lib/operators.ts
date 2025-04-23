import {sql} from 'drizzle-orm'

/**
 * Example: eq(schema.connection.connector_name, any(connectorNames))
 *
 * Alternative to `inArray` for postgres that can handle empty array and only takes up a single apram
 * resuling in better prepared queries
 *
 */
export function any(values: string[]) {
  return sql`ANY (${sql.param(values)})`
}
