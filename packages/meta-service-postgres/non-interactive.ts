import {camelCase, snakeCase} from 'change-case'
// Need to use version 4.x of change-case that still supports cjs
// pureESM modules are idealistic...
import type {Viewer, ZRaw} from '@openint/cdk'
import {zViewer} from '@openint/cdk'
import {zPgConfig} from '@openint/connector-postgres/def'
import {
  applyLimitOffset,
  dbUpsertOne,
  drizzle,
  getDb,
  neonSql,
  SQL,
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

type Deps = ReturnType<typeof _getDeps>
const _getDeps = (opts: {databaseUrl: string; viewer: Viewer}) => {
  const {viewer, databaseUrl} = opts
  const _getDb = () => {
    const {db} = getDb(databaseUrl)
    return db
  }
  const {db} = getDb(databaseUrl)
  if (__DEBUG__) {
    console.log(
      'Setting up postgres meta service for database in host',
      new URL(databaseUrl).host,
    )
  }

  return {
    db,
    getDb: _getDb,
    runQuery: async <T>(query: any): Promise<T> => {
      const queries: any[] = []
      // assume role logic
      for (const [key, value] of Object.entries(localGucForViewer(viewer))) {
        // true is for isLocal, which means it will only affect the current transaction, not the whole session
        queries.push(neonSql`SELECT set_config(${key}, ${value}, true)`)
      }
      console.log('query', query.parameterizedQuery)
      queries.push(query)
      const res = await neonSql.transaction(queries)
      console.log('resqq', res)
      return res as T
    },
  }
}

export const makePostgresMetaService = zFunction(
  zPgConfig.pick({databaseUrl: true}).extend({viewer: zViewer}),
  (opts): MetaService => {
    const tables: MetaService['tables'] = {
      connection: metaTable('connection', _getDeps(opts)),
      integration: metaTable('integration', _getDeps(opts)),
      connector_config: metaTable('connector_config', _getDeps(opts)),
      pipeline: metaTable('pipeline', _getDeps(opts)),
      event: metaTable('event', _getDeps(opts)),
    }
    return {
      tables,
      searchCustomers: ({keywords, ...rest}) => {
        const {runQuery} = _getDeps(opts)
        const where = keywords
          ? neonSql`WHERE customer_id ILIKE ${'%' + keywords + '%'}`
          : neonSql``
        return runQuery(
          applyLimitOffset(
            neonSql`
              SELECT
                customer_id as id,
                count(*) AS connection_count,
                min(created_at) AS first_created_at,
                max(updated_at) AS last_updated_at
              FROM connection
              ${where}
              GROUP BY customer_id
            `,
            rest,
          ),
        ).then((res) =>
          res.rows.map((row) => camelCaseKeys(row) as CustomerResultRow),
        )
      },

      searchIntegrations: ({keywords, connectorNames, ...rest}) => {
        const {runQuery} = _getDeps(opts)
        const conditions = R.compact([
          connectorNames &&
            neonSql`connector_name = ANY(${sql.param(connectorNames)})`,
          keywords && neonSql`standard->>'name' ILIKE ${'%' + keywords + '%'}`,
        ])
        const where =
          conditions.length > 0
            ? neonSql`WHERE ${sql.join(conditions, neonSql` AND `)}`
            : neonSql``
        return runQuery(
          applyLimitOffset(neonSql`SELECT * FROM integration ${where}`, rest),
        ).then((res) =>
          res.rows.map((row) => camelCaseKeys(row) as ZRaw['integration']),
        )
      },

      findPipelines: ({
        connectionIds,
        secondsSinceLastSync,
        includeDisabled,
      }) => {
        const {runQuery} = _getDeps(opts)
        const ids = connectionIds && sql.param(connectionIds)
        const conditions = R.compact([
          ids &&
            neonSql`(source_id = ANY(${ids}) OR destination_id = ANY(${ids}))`,
          secondsSinceLastSync &&
            neonSql`
            (now() - COALESCE(last_sync_completed_at, to_timestamp(0)))
            >= (interval '1 second' * ${secondsSinceLastSync})
          `,
          !includeDisabled && neonSql`disabled IS NOT TRUE`,
        ])
        const where =
          conditions.length > 0
            ? neonSql`WHERE ${sql.join(conditions, neonSql` AND `)}`
            : neonSql``
        return runQuery(neonSql`SELECT * FROM pipeline ${where}`).then((res) =>
          res.rows.map((row) => camelCaseKeys(row)),
        )
      },

      listConnectorConfigInfos: ({id, connectorName} = {}) => {
        const {runQuery} = _getDeps(opts)
        return runQuery(
          neonSql`
            SELECT id, env_name, display_name, COALESCE(config->'integrations', '{}'::jsonb) as integrations 
            FROM connector_config ${
              id && connectorName
                ? neonSql`WHERE id = ${id} AND connector_name = ${connectorName} AND disabled = FALSE`
                : id
                  ? neonSql`WHERE id = ${id} AND disabled = FALSE`
                  : connectorName
                    ? neonSql`WHERE connector_name = ${connectorName} AND disabled = FALSE`
                    : neonSql`WHERE disabled = FALSE`
            }
          `,
        ).then((res) => res.rows.map((row) => camelCaseKeys(row)))
      },

      findConnectionsMissingDefaultPipeline: () => {
        const {runQuery} = _getDeps(opts)
        return runQuery(
          neonSql`
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
          `,
        ).then((res) => res.rows)
      },

      isHealthy: async (checkDefaultPostgresConnections = false) => {
        const {runQuery} = _getDeps({...opts, viewer: {role: 'system'}})

        const isMainDbHealthy = await runQuery(neonSql`SELECT 1`)
        if (!isMainDbHealthy || isMainDbHealthy.rows.length !== 1) {
          return {healthy: false, error: 'Main database is not healthy'}
        }

        const top3DefaultPostgresConnections = await runQuery(
          neonSql`
            SELECT id, settings->>'databaseUrl' as database_url 
            FROM connection 
            WHERE id like 'conn_postgres_default_%' 
            ORDER BY updated_at DESC 
            LIMIT 3
          `,
        )

        if (checkDefaultPostgresConnections) {
          for (const connection of top3DefaultPostgresConnections.rows) {
            if (!connection['database_url']) {
              continue
            }
            const connDb = drizzle(connection['database_url'] as string, {
              logger: __DEBUG__,
            })
            const res = await connDb.execute(neonSql`SELECT 1`)
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
  {runQuery, getDb}: Deps,
): MetaTable<TID, T> {
  const table = sql.identifier(tableName)

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
    }) => {
      const conditions = R.compact([
        ids && neonSql`id = ANY(${sql.param(ids)})`,
        customerId ? neonSql`customer_id = ${customerId}` : null,
        connectorConfigId &&
          neonSql`connector_config_id = ${connectorConfigId}`,
        connectorName && neonSql`connector_name = ${connectorName}`,
        keywords &&
          tableName === 'integration' &&
          neonSql`standard->>'name' ILIKE ${'%' + keywords + '%'}`,
        since &&
          (tableName === 'event'
            ? neonSql`timestamp > ${sql.param(new Date(since).toISOString())}`
            : neonSql`created_at > ${sql.param(
                new Date(since).toISOString(),
              )}`),
        ...Object.entries(rest.where ?? {}).map(
          ([k, v]) => neonSql`${sql.identifier(k)} = ${v}`,
        ),
      ])
      const where =
        conditions.length > 0
          ? neonSql`WHERE ${sql.join(conditions, neonSql` AND `)}`
          : neonSql``
      return runQuery(
        applyLimitOffset(neonSql`SELECT * FROM ${table} ${where}`, rest),
      ).then((res) => res.rows.map((row) => camelCaseKeys(row) as T))
    },

    get: (id) => {
      return runQuery(neonSql`SELECT * FROM ${table} where id = ${id}`).then(
        (res) => (res.rows[0] ? (camelCaseKeys(res.rows[0]) as T) : undefined),
      )
    },

    set: (id, data) =>
      dbUpsertOne(getDb(), tableName, snakeCaseKeys({...data, id}), {
        keyColumns: ['id'],
      }),

    patch: (id, data) =>
      dbUpsertOne(getDb(), tableName, snakeCaseKeys({...data, id}), {
        keyColumns: ['id'],
        shallowMergeJsonbColumns: true,
      }),

    delete: (id) => {
      return runQuery(neonSql`DELETE FROM ${table} WHERE id = ${id}`).then(
        () => {},
      )
    },
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
