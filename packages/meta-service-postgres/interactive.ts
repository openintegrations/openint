import {camelCase, snakeCase} from 'change-case'
// Need to use version 4.x of change-case that still supports cjs
// pureESM modules are idealistic...
import type {Viewer, ZRaw} from '@openint/cdk'
import {zViewer} from '@openint/cdk'
import {zPgConfig} from '@openint/connector-postgres/def'
import {applyLimitOffset, dbUpsertOne, drizzle, getDb, sql} from '@openint/db'
import type {
  CustomerResultRow,
  MetaService,
  MetaTable,
} from '@openint/engine-backend'
import {R, zFunction} from '@openint/util'
import {__DEBUG__} from '../../apps/app-config/constants'

/**
 * This sets the postgres grand unified config (GUC) and determines the identity
 * that gets used for every request to db for the purpose of authorization
 * in row-level-security! So be very careful
 */
function localGucForViewer(viewer: Viewer) {
  switch (viewer.role) {
    case 'anon':
      return {role: 'anon'}
    case 'customer':
      return {
        role: 'customer',
        'request.jwt.claim.customer_id': viewer.customerId,
        'request.jwt.claim.org_id': viewer.orgId,
      }
    case 'user':
      return {
        role: 'authenticated',
        'request.jwt.claim.sub': viewer.userId,
        'request.jwt.claim.org_id': viewer.orgId ?? null,
      }
    case 'org':
      return {role: 'org', 'request.jwt.claim.org_id': viewer.orgId}
    case 'system':
      return {role: null} // Should be the same as reset role and therefore operates without RLS policy
    default:
      throw new Error(`Unknown viewer role: ${(viewer as Viewer).role}`)
  }
  // Should we erase keys incompatible with current viewer role to avoid confusion?
}

type Deps = ReturnType<typeof _getDeps>
const _getDeps = (opts: {databaseUrl: string; viewer: Viewer}) => {
  const {viewer, databaseUrl} = opts
  const _getDb = () => {
    const {db} = getDb(databaseUrl)
    return db
  }
  const {db, pool} = getDb(databaseUrl)

  if (__DEBUG__) {
    console.log(
      'Setting up postgres meta service for database in host',
      new URL(databaseUrl).host,
    )
  }

  async function assumeRole(client: any, viewer: Viewer) {
    for (const [key, value] of Object.entries(localGucForViewer(viewer))) {
      await client.query('SELECT set_config($1, $2, true)', [key, value])
    }
  }

  return {
    db,
    getDb: _getDb,
    runQueries: async <T>(handler: (client: any) => Promise<T>): Promise<T> => {
      const client = await pool.connect()
      try {
        console.log('[runQueries] Beginning transaction')
        await client.query('BEGIN')

        console.log('[runQueries] Assuming role for viewer:', viewer.role)
        await assumeRole(client, viewer)

        // const result = await client.query(sql`SELECT 33`)
        console.log('[runQueries] Executing handler')
        const result = await handler(client)
        // console.log('[runQueries] Result:', result)

        // console.log('[runQueries] Committing transaction')
        await client.query('COMMIT')
        console.log('[runQueries] Result:', result)

        console.log('[runQueries] Transaction complete, returning result')
        return result
      } catch (err) {
        console.error('[runQueries] Error executing transaction:', err)
        console.log('[runQueries] Rolling back transaction')
        await client.query('ROLLBACK')
        console.log('[runQueries] Transaction rolled back')
        throw err
      } finally {
        console.log('[runQueries] Releasing client connection')
        client.release()
      }
    },
  }
}

export const makePostgresMetaService = zFunction(
  zPgConfig.pick({databaseUrl: true}).extend({viewer: zViewer}),
  (opts): MetaService => {
    const tables: MetaService['tables'] = {
      // customer: metaTable('customer', _getDeps(opts)),
      // Delay calling of __getDeps until later..
      connection: metaTable('connection', _getDeps(opts)),
      integration: metaTable('integration', _getDeps(opts)),
      connector_config: metaTable('connector_config', _getDeps(opts)),
      pipeline: metaTable('pipeline', _getDeps(opts)),
      event: metaTable('event', _getDeps(opts)),
    }
    return {
      tables,
      searchCustomers: async ({keywords, ...rest}) => {
        const {runQueries} = _getDeps(opts)
        const params: string[] = []
        let whereClause = ''

        if (keywords) {
          whereClause = 'WHERE customer_id ILIKE $1'
          params.push('%' + keywords + '%')
        }

        const query = `
          SELECT
            customer_id as id,
            count(*) AS connection_count,
            min(created_at) AS first_created_at,
            max(updated_at) AS last_updated_at
          FROM connection
          ${whereClause}
          GROUP BY customer_id
        `
        return runQueries(async (client) => {
          const {rows} = await client.query(query, params)
          return rows.map((r: any) => camelCaseKeys(r) as CustomerResultRow)
        })
      },
      searchIntegrations: ({keywords, connectorNames, ...rest}) => {
        const {runQueries} = _getDeps(opts)
        const conditions = []
        const params: string[] = []
        let paramCount = 1

        if (connectorNames) {
          for (const name of connectorNames) {
            conditions.push(`connector_name = $${paramCount}`)
            params.push(name)
            paramCount++
          }
        }
        if (keywords) {
          conditions.push(`standard->>'name' ILIKE $${paramCount}`)
          params.push('%' + keywords + '%')
          paramCount++
        }

        const whereClause =
          conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        return runQueries(async (client) => {
          const {rows} = await client.query(
            `SELECT * FROM integration ${whereClause}`,
            params,
          )
          return rows.map((r: any) => camelCaseKeys(r) as ZRaw['integration'])
        })
      },
      findPipelines: ({
        connectionIds,
        secondsSinceLastSync,
        includeDisabled,
      }) => {
        const {runQueries} = _getDeps(opts)
        const conditions = []
        const params: string[] = []
        let paramCount = 1

        if (connectionIds) {
          conditions.push(
            `(source_id = ANY($${paramCount}) OR destination_id = ANY($${paramCount}))`,
          )
          for (const id of connectionIds) {
            params.push(id)
          }
          paramCount += connectionIds.length
        }
        if (secondsSinceLastSync) {
          conditions.push(`
            (now() - COALESCE(last_sync_completed_at, to_timestamp(0)))
            >= (interval '1 second' * $${paramCount})
          `)
          params.push(secondsSinceLastSync.toString())
          paramCount++
        }
        if (!includeDisabled) {
          conditions.push('disabled IS NOT TRUE')
        }

        const whereClause =
          conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        return runQueries(async (client) => {
          const {rows} = await client.query(
            `SELECT * FROM pipeline ${whereClause}`,
            params,
          )
          return rows.map((r: any) => camelCaseKeys(r))
        })
      },
      listConnectorConfigInfos: ({id, connectorName} = {}) => {
        const {runQueries} = _getDeps(opts)
        const conditions = ['disabled = FALSE']
        const params: string[] = []
        let paramCount = 1

        if (id) {
          conditions.push(`id = $${paramCount}`)
          params.push(id)
          paramCount++
        }
        if (connectorName) {
          conditions.push(`connector_name = $${paramCount}`)
          params.push(connectorName)
          paramCount++
        }

        return runQueries(async (client) => {
          const {rows} = await client.query(
            `SELECT id, env_name, display_name, COALESCE(config->'integrations', '{}'::jsonb) as integrations 
             FROM connector_config 
             WHERE ${conditions.join(' AND ')}`,
            params,
          )
          return rows.map((r: any) => camelCaseKeys(r))
        })
      },
      findConnectionsMissingDefaultPipeline: () => {
        const {runQueries} = _getDeps(opts)
        return runQueries(async (client) => {
          const {rows} = await client.query(sql`
            SELECT
              c.id,
              cc.default_pipe_out_destination_id,
              cc.default_pipe_in_source_id,
              pipe_out.id destination_pipeline_id,
              pipe_in.id source_pipeline_id
            FROM
              connection c
              JOIN connector_config cc ON c.connector_config_id = cc.id
              LEFT JOIN pipeline pipe_out ON pipe_out.source_id = c.id
                AND pipe_out.destination_id = cc.default_pipe_out_destination_id
              LEFT JOIN pipeline pipe_in ON pipe_in.destination_id = c.id
                AND pipe_in.source_id = cc.default_pipe_in_source_id
            WHERE (cc.default_pipe_out_destination_id IS NOT NULL AND pipe_out IS NULL)
              OR (cc.default_pipe_in_source_id IS NOT NULL AND pipe_in IS NULL)
          `)
          return rows
        })
      },
      isHealthy: async (checkDefaultPostgresConnections = false) => {
        const {runQueries} = _getDeps({
          ...opts,
          // hardcoding to system viewer to avoid any authorization checks
          viewer: {role: 'system'},
        })

        const isMainDbHealthy = await runQueries(async (client) => {
          const {rows} = await client.query(sql`SELECT 1`)
          return rows
        })

        if (!isMainDbHealthy || isMainDbHealthy.length !== 1) {
          return {healthy: false, error: 'Main database is not healthy'}
        }

        // TODO:(@pellicceama) to use sql token rather than hard coding here.
        const top3DefaultPostgresConnections = await runQueries(
          async (client) => {
            const {rows} = await client.query(
              sql`SELECT id, settings->>'databaseUrl' as database_url FROM connection where id like 'conn_postgres_default_%' ORDER BY updated_at DESC LIMIT 3`,
            )
            return rows
          },
        )

        if (checkDefaultPostgresConnections) {
          for (const connection of top3DefaultPostgresConnections) {
            if (!connection['database_url']) {
              continue
            }
            const connDb = drizzle(connection['database_url'] as string, {
              logger: __DEBUG__,
            })
            const res = await connDb.execute(sql`SELECT 1`)
            if (res.rows.length !== 1) {
              return {
                healthy: false,
                error: `Default postgres connection with id ${connection['id']} is not healthy`,
              }
            }
          }
        }
        return {healthy: true}
      },
    }
  },
)

function metaTable<TID extends string, T extends Record<string, unknown>>(
  tableName: keyof ZRaw,
  {runQueries, getDb}: Deps,
): MetaTable<TID, T> {
  const table = sql.identifier(tableName)

  //  const sqlType = sql.type(zRaw[tableName])

  // TODO: Convert case from snake_case to camelCase
  return {
    list: ({
      ids,
      customerId,
      connectorConfigId,
      connectorName,
      since,
      keywords,
      orderBy,
      order,
      ...rest
    }) =>
      runQueries(async (client) => {
        const conditions = []
        const params = []
        let paramCount = 1

        if (ids) {
          conditions.push(`id = ANY($${paramCount})`)
          params.push(ids)
          paramCount++
        }
        if (customerId) {
          conditions.push(`customer_id = $${paramCount}`)
          params.push(customerId)
          paramCount++
        }
        if (connectorConfigId) {
          conditions.push(`connector_config_id = $${paramCount}`)
          params.push(connectorConfigId)
          paramCount++
        }
        if (connectorName) {
          conditions.push(`connector_name = $${paramCount}`)
          params.push(connectorName)
          paramCount++
        }
        if (keywords && tableName === 'integration') {
          conditions.push(`standard->>'name' ILIKE $${paramCount}`)
          params.push(`%${keywords}%`)
          paramCount++
        }
        if (since) {
          const dateField = tableName === 'event' ? 'timestamp' : 'created_at'
          conditions.push(`${dateField} > $${paramCount}`)
          params.push(new Date(since).toISOString())
          paramCount++
        }

        const where =
          conditions.length > 0
            ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
            : sql``

        const query = applyLimitOffset(
          sql`SELECT * FROM ${table} ${where}`,
          rest,
        )
        const {rows} = await client.query(query, params)
        return rows.map((r: any) => camelCaseKeys(r) as T)
      }),
    get: (id) =>
      runQueries(async (client) => {
        const {rows} = await client.query(
          sql`SELECT * FROM ${table} WHERE id = $1`,
          [id],
        )
        return rows[0] ? (camelCaseKeys(rows[0]) as T) : undefined
      }),
    set: (id, data) =>
      dbUpsertOne(getDb(), tableName, snakeCaseKeys({...data, id}), {
        keyColumns: ['id'],
      }),
    patch: (id, data) =>
      // use getDb to workaround drizzle schema cache issue
      dbUpsertOne(getDb(), tableName, snakeCaseKeys({...data, id}), {
        keyColumns: ['id'],
        shallowMergeJsonbColumns: true,
      }),
    delete: (id) =>
      runQueries(async (client) => {
        await client.query(sql`DELETE FROM ${table} WHERE id = $1`, [id])
      }),
  }
}

/** Temporary placeholder before we transition API / codebase to fully snake_case */
function camelCaseKeys<T = Record<string, unknown>>(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [camelCase(k), v]),
  ) as T
}

/** Temporary placeholder before we transition API / codebase to fully snake_case */
function snakeCaseKeys<T = Record<string, unknown>>(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [snakeCase(k), v]),
  ) as T
}
