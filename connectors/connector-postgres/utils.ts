import {sql} from 'drizzle-orm'
import type {PgColumn, PgDatabase} from 'drizzle-orm/pg-core'
import {pgTable, uniqueIndex} from 'drizzle-orm/pg-core'
import type {RecordMessageBody} from './def'

export function isValidDateString(str: string) {
  const date = new Date(str)
  const lenToCheck = Math.min(str.length, '2021-01-01T00:00:00'.length)
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, lenToCheck) === str.slice(0, lenToCheck)
  )
}

/**
 * We probably want something based off of the Catalog protocol, by inferring catalog
 * from data object and then generating a migration from the catalog message as a two step,
 * unified process.
 * For now we just do something lightweig thought
 *
 * Also consider deduping with inferTableForUpsert
 */
export function inferTableFromMessage(event: RecordMessageBody) {
  // TODO Implement namespace and upsert metadata support
  return pgTable(
    event.stream,
    (t) => {
      function inferCol(v: unknown) {
        if (typeof v === 'string') {
          return isValidDateString(v) ? t.timestamp({mode: 'string'}) : t.text()
        }
        if (typeof v === 'number') {
          return Math.floor(v) === v ? t.integer() : t.doublePrecision()
        }
        if (typeof v === 'boolean') {
          return t.boolean()
        }
        if (v instanceof Date) {
          return t.timestamp()
        }
        return t.jsonb()
      }
      return Object.fromEntries(
        Object.entries(event.data).map(([k, v]) => [k, inferCol(v)]),
      )
    },
    (table) =>
      // TODO: Check against existing primary key and unique indexes
      // to not create if already there?
      // && Object.values(table).filter(c => c.i)
      event.upsert?.key_columns
        ? [
            uniqueIndex(`${event.stream}_upsert_keys`).on(
              ...(event.upsert.key_columns.map(
                (col) => table[col] as PgColumn,
              ) as [PgColumn]),
            ),
          ]
        : [],
  )
}

export async function runMigrationForStandardTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any>,
  tableName: string,
) {
  // TODO: turn this into a drizzle table
  // Where do we want to put data? Not always public...
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(tableName)} (
      _openint_customer_id VARCHAR,
      _openint_source_id VARCHAR NOT NULL,
      id VARCHAR NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL,
      connector_name VARCHAR GENERATED ALWAYS AS (split_part((source_id)::text, '_'::text, 2)) STORED NOT NULL,
      CONSTRAINT ${sql.identifier(
        `pk_${tableName}`,
      )} PRIMARY KEY ("source_id", "id"),
      unified jsonb,
      raw jsonb DEFAULT '{}'::jsonb NOT NULL
    );
  `)
  // NOTE: Should we add org_id?
  // NOTE: Rename `unified` to `unified` and `raw` to `raw` or `remote` or `original`
  // NOTE: add prefix check would be nice
  // for (const col of [
  //   'id',
  //   'source_id',
  //   'connector_name',
  //   'created_at',
  //   'updated_at',
  //   'customer_id',
  // ]) {
  //   await pool.query(sql`
  //     CREATE INDEX IF NOT EXISTS ${sql.identifier([
  //       `${tableName}_${col}`,
  //     ])} ON ${table} (${sql.identifier([col])});
  //   `)
  // }
}
