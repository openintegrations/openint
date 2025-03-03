import {neon, neonConfig} from '@neondatabase/serverless'
import {drizzle as drizzlePgProxy} from 'drizzle-orm/pg-proxy'
import {migrate} from 'drizzle-orm/pg-proxy/migrator'
import type {Viewer} from '@openint/cdk'
import type {DbOptions} from './db'
import {dbFactory, getDrizzleConfig, getMigrationConfig} from './db'
import {localGucForViewer} from './schema/rls'

export function initDbNeon(
  url: string,
  viewer: Viewer,
  options: DbOptions = {},
) {
  if (!url.includes('neon') && !url.includes('localtest')) {
    throw new Error('Only neon database urls are supported with initDbNeon')
  }

  // This is unfortunately global...
  neonConfig.fetchEndpoint = (host) => {
    // localhost does not work because neon proxy expects to work with SNI and would result in error
    // invalid hostname: Common name inferred from SNI ('localhost') is not known
    // Therefore we need to use db.localtest.me as an alternative.
    // to work completely offline, add to `/etc/hosts`
    // 127.0.0.1 db.localtest.me
    const [protocol, port] =
      host === 'db.localtest.me' ? ['http', 4444] : ['https', 443]
    return `${protocol}://${host}:${port}/sql`
  }
  const neonSql = neon(url)

  const db = drizzlePgProxy(async (query, params, method) => {
    const guc = localGucForViewer(viewer)

    // NOTE: this should work but it doesn't, for now hardcoding converting any updated_at and created_at to iso strings
    // import types from 'pg-types'

    // types.setTypeParser(1184, (value: string) => {
    //   console.log('Timestamp parser called with:', value)
    //   return value ? new Date(value).toISOString() : null
    // })
    const allResponses = await neonSql.transaction(
      [
        ...Object.entries(guc).map(
          ([key, value]) => neonSql`SELECT set_config(${key}, ${value}, true)`,
        ),
        neonSql(query, params),
      ],
      {fullResults: true, arrayMode: method === 'all' /* types, */},
    )
    const res = allResponses.pop()

    // TODO: Make me work for arrayMode: true
    if (res?.rows) {
      res.rows = res.rows.map((row) => {
        if (typeof row === 'object' && row !== null) {
          const newRow: Record<string, unknown> = {...row}
          for (const key in newRow) {
            if (newRow[key] instanceof Date) {
              newRow[key] = newRow[key].toISOString()
            }
          }
          return newRow
        }
        return row
      })
    }

    return {rows: res?.rows ?? []}
  }, getDrizzleConfig(options))

  return dbFactory('neon', db, {
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res as any[]}
    },
    $migrate() {
      return migrate(
        db,
        async (queries) => {
          await neonSql.transaction(queries.map((q) => neonSql(q)))
        },
        getMigrationConfig(),
      )
    },
  })
}
