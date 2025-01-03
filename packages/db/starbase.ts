import {sql} from 'drizzle-orm'
import {
  getTableConfig,
  type PgInsertValue,
  type PgTable,
} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/sqlite-proxy'
import {starbase} from 'drizzle-starbase'
import {DbUpsertOptions, removeUndefinedValues} from './upsert'

const STARBASE_ENDPOINT =
  process.env['STARBASE_ENDPOINT'] ??
  'https://starbasedb.YOUR-ID-HERE.workers.dev'
const STARBASE_AUTH_TOKEN = process.env['STARBASE_AUTH_TOKEN'] ?? 'ABC123'

const starbaseDb = drizzle(...starbase(STARBASE_ENDPOINT, STARBASE_AUTH_TOKEN))

export async function runMigrationForStandardTableStarbase(tableName: string) {
  return await starbaseDb.run(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(tableName)} (
      source_id TEXT NOT NULL,
      id TEXT NOT NULL,
      customer_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      connector_name TEXT,
      unified JSON,
      raw JSON DEFAULT '{}',
      PRIMARY KEY (source_id, id)
    )
  `)
}

export async function dbUpsertStarbase<
  TTable extends PgTable,
  TValue extends Record<string, unknown> = PgInsertValue<TTable>,
>(
  _table: TTable | string,
  _values: Array<TValue>,
  options: DbUpsertOptions<TTable> = {},
) {
  if (!_values.length) return

  const tableName =
    typeof _table === 'string' ? _table : getTableConfig(_table).name
  const values = options.undefinedAsDefault
    ? _values
    : _values.map(removeUndefinedValues)
  const keyColumns = options.keyColumns ?? Object.keys(values[0] ?? {})
  const columns = Object.keys(values[0] ?? {})

  const processValue = (value: any) => {
    const processed = {...value}
    if (processed.unified) {
      processed.unified = JSON.stringify(processed.unified)
    }
    if (processed.raw) {
      processed.raw = JSON.stringify(processed.raw)
    }
    return processed
  }

  for (const value of values) {
    const processedValue = processValue(value)

    const nonKeyColumns = columns.filter((col) => !keyColumns.includes(col))
    const query = {
      sql: `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${columns.map(() => '?').join(', ')})
        ON CONFLICT (${keyColumns.join(', ')}) 
        DO UPDATE SET 
        ${nonKeyColumns.map((col) => `${col} = EXCLUDED.${col}`).join(', ')}
      `.trim(),
      params: columns.map((col) => processedValue[col]), // Only need INSERT values
    }

    const response = await fetch(`${STARBASE_ENDPOINT}/query/raw`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STARBASE_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    })

    if (!response.ok) {
      throw new Error(
        `Starbase upsert request failed: ${await response.text()}`,
      )
    }
  }
}
