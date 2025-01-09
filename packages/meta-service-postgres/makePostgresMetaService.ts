import {camelCase, snakeCase} from 'change-case'
import type {Id, Viewer, ZRaw} from '@openint/cdk'
import {zViewer} from '@openint/cdk'
import {zPgConfig} from '@openint/connector-postgres/def'
import {
  applyLimitOffset,
  dbUpsertOne,
  drizzle,
  postgres,
  sql,
} from '@openint/db'
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

async function assumeRole(options: {
  db: Pick<ReturnType<typeof drizzle>, 'execute'>
  viewer: Viewer
}) {
  const {db, viewer} = options
  for (const [key, value] of Object.entries(localGucForViewer(viewer))) {
    // true is for isLocal, which means it will only affect the current transaction, not the whole session
    await db.execute(sql`SELECT set_config(${key}, ${value}, true)`)
  }
}

type Deps = ReturnType<typeof _getDeps>
const _getDeps = (opts: {databaseUrl: string; viewer: Viewer}) => {
  const {viewer, databaseUrl} = opts
  const pg = postgres(databaseUrl)
  const getDb = () => drizzle(pg, {logger: __DEBUG__})
  const db = getDb()
  type PgTransaction = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]

  return {
    db,
    pg,
    getDb,
    runQueries: async <T>(
      handler: (trxn: PgTransaction) => Promise<T>,
      // eslint-disable-next-line arrow-body-style
    ) => {
      // const res = await db.transaction(async (trxn) => {
      //   return !!trxn
      // })
      return await db.transaction(async (txn) => {
        await assumeRole({db: txn, viewer})
        return handler(txn)
      })
    },
  }
}

export const makePostgresMetaService = zFunction(
  zPgConfig.pick({databaseUrl: true}).extend({viewer: zViewer}),
  (opts): MetaService => {
    const tables: MetaService['tables'] = {
      customer: metaTable('customer', _getDeps(opts)),
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
        const where = keywords
          ? sql`WHERE customer_id ILIKE ${'%' + keywords + '%'}`
          : sql``
        const query = applyLimitOffset(
          sql`
            SELECT
              customer_id as id,
              count(*) AS connection_count,
              min(created_at) AS first_created_at,
              max(updated_at) AS last_updated_at
            FROM
              connection
            ${where}
            GROUP BY customer_id
          `,
          rest,
        )
        return runQueries(async (trxn) => {
          const rows = await trxn.execute(query)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return rows.map((r) => camelCaseKeys(r) as CustomerResultRow)
        })
      },
      searchIntegrations: ({keywords, connectorNames, ...rest}) => {
        const {runQueries} = _getDeps(opts)
        const conditions = R.compact([
          connectorNames &&
            sql`connector_name = ANY(${sql.param(connectorNames)})`,
          keywords && sql`standard->>'name' ILIKE ${'%' + keywords + '%'}`,
        ])
        const where =
          conditions.length > 0
            ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
            : sql``
        return runQueries((trxn) =>
          trxn
            .execute(
              applyLimitOffset(sql`SELECT * FROM integration ${where}`, rest),
            )
            .then((rows) =>
              rows.map((r) => camelCaseKeys(r) as ZRaw['integration']),
            ),
        )
      },

      findPipelines: ({
        connectionIds,
        secondsSinceLastSync,
        includeDisabled,
      }) => {
        const {runQueries} = _getDeps(opts)
        const ids = connectionIds && sql.param(connectionIds)
        const conditions = R.compact([
          ids && sql`(source_id = ANY(${ids}) OR destination_id = ANY(${ids}))`,
          secondsSinceLastSync &&
            sql`
              (now() - COALESCE(last_sync_completed_at, to_timestamp(0)))
              >= (interval '1 second' * ${secondsSinceLastSync})
            `,
          !includeDisabled && sql`disabled IS NOT TRUE`,
        ])
        const where =
          conditions.length > 0
            ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
            : sql``
        return runQueries((trxn) =>
          trxn
            .execute(sql`SELECT * FROM pipeline ${where}`)
            .then((rows) => rows.map((r) => camelCaseKeys(r))),
        )
      },
      listConnectorConfigInfos: ({id, connectorName} = {}) => {
        const {runQueries} = _getDeps(opts)
        return runQueries((trxn) =>
          trxn
            .execute(
              sql`SELECT id, env_name, display_name, COALESCE(config->'integrations', '{}'::jsonb) as integrations FROM connector_config ${
                id && connectorName
                  ? sql`WHERE id = ${id} AND connector_name = ${connectorName} AND disabled = FALSE`
                  : id
                    ? sql`WHERE id = ${id} AND disabled = FALSE`
                    : connectorName
                      ? sql`WHERE connector_name = ${connectorName} AND disabled = FALSE`
                      : sql`WHERE disabled = FALSE`
              }`,
            )
            .then((rows) => rows.map((r) => camelCaseKeys(r))),
        )
      },
      findConnectionsMissingDefaultPipeline: () => {
        const {runQueries} = _getDeps(opts)
        return runQueries((trxn) =>
          trxn.execute<{id: Id['conn']}>(sql`
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
          `),
        )
      },
      isHealthy: async (checkDefaultPostgresConnections = false) => {
        const {runQueries} = _getDeps({
          ...opts,
          // hardcoding to system viewer to avoid any authorization checks
          viewer: {role: 'system'},
        })

        const isMainDbHealthy = await runQueries((trxn) =>
          trxn.execute(sql`SELECT 1`),
        )

        if (!isMainDbHealthy || isMainDbHealthy.length !== 1) {
          return {healthy: false, error: 'Main database is not healthy'}
        }

        // TODO:(@pellicceama) to use sql token rather than hard coding here.
        const top3DefaultPostgresConnections = await runQueries((trxn) =>
          trxn.execute(
            sql`SELECT id, settings->>'databaseUrl' as database_url FROM connection where id like 'conn_postgres_default_%' ORDER BY updated_at DESC LIMIT 3`,
          ),
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
            if (res.length !== 1) {
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
      runQueries(async (trxn) => {
        const conditions = R.compact([
          ids && sql`id = ANY(${sql.param(ids)})`,
          customerId ? sql`customer_id = ${customerId}` : null,
          connectorConfigId && sql`connector_config_id = ${connectorConfigId}`,
          connectorName && sql`connector_name = ${connectorName}`,
          // Temp solution, shall use fts and make this work for any table...
          keywords &&
            tableName === 'integration' &&
            sql`standard->>'name' ILIKE ${'%' + keywords + '%'}`,
          since &&
            (tableName === 'event'
              ? sql`timestamp > ${sql.param(new Date(since).toISOString())}`
              : sql`created_at > ${sql.param(new Date(since).toISOString())}`),
          ...Object.entries(rest.where ?? {}).map(
            ([k, v]) => sql`${sql.identifier(k)} = ${v}`,
          ),
        ])
        console.log('conditions ', customerId, rest)
        const where =
          conditions.length > 0
            ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
            : sql``
        const res = await trxn.execute<T>(
          applyLimitOffset(sql`SELECT * FROM ${table} ${where}`, rest),
        )
        return res.map((r) => camelCaseKeys(r) as T)
      }),
    get: (id) =>
      runQueries(async (trxn) => {
        const rows = await trxn.execute<T>(
          sql`SELECT * FROM ${table} where id = ${id}`,
        )
        return rows.map(camelCaseKeys)[0] as T | undefined
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
      runQueries((trxn) =>
        trxn.execute(sql`DELETE FROM ${table} WHERE id = ${id}`),
      ).then(() => {}),
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
