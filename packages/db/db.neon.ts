import {
  HTTPQueryOptions,
  neon,
  neonConfig,
  NeonQueryFunction,
} from '@neondatabase/serverless'
import {drizzle as drizzlePgProxy} from 'drizzle-orm/pg-proxy'
import {migrate} from 'drizzle-orm/pg-proxy/migrator'
import {types} from 'pg'
import type {Viewer} from '@openint/cdk'
import type {DbOptions} from './db'
import {dbFactory, getDrizzleConfig, getMigrationConfig} from './db'
import {localGucForViewer} from './schema/rls'

function drizzleForViewer(
  neonSql: NeonQueryFunction<false, false>,
  viewer: Viewer | null,
  options: DbOptions,
) {
  return drizzlePgProxy(async (query, params, method) => {
    const opts: HTTPQueryOptions<boolean, true> = {
      fullResults: true,
      arrayMode: method === 'all',
      types, // types does not seem to work at initialization time, and thus we have to further add it to every query
    }

    const allResponses = !viewer
      ? await neonSql(query, params, opts).then((r) => [r])
      : await neonSql.transaction(
          [
            // Arguably system viewer does not need to be surrounded in transaction, but we need it for consistency
            // Also that prevent things like DROP DATABASE
            // guc settings are local to transactions anyways and without setting them should have the
            // same impact as reset role
            ...Object.entries(localGucForViewer(viewer)).map(
              ([key, value]) =>
                neonSql`SELECT set_config(${key}, ${value}, true)`,
            ),
            neonSql(query, params),
          ],
          opts,
        )
    const res = allResponses.pop()

    return {rows: res?.rows ?? []}
  }, getDrizzleConfig(options))
}

export function initDbNeon(url: string, options: DbOptions = {}) {
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
  // this is also unfortunately global... in particular it shares state with
  // node postgres driver as well. However at least we want consistent type parsing...
  types.setTypeParser(types.builtins.DATE, (val) => val)
  types.setTypeParser(types.builtins.TIMESTAMP, (val) => val)
  types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val)
  types.setTypeParser(types.builtins.INTERVAL, (val) => val)

  const neonSql = neon(url, {types})

  const db = drizzleForViewer(neonSql, null, options)

  return dbFactory('neon', db, {
    $asViewer: (viewer) => drizzleForViewer(neonSql, viewer, options),
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
