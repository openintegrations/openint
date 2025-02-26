import {camelCase, snakeCase} from 'change-case'
// Need to use version 4.x of change-case that still supports cjs
// pureESM modules are idealistic...
import type {Id, Viewer, ZRaw} from '@openint/cdk'
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

type Deps = ReturnType<typeof _getDeps>
const _getDeps = async (opts: {databaseUrl: string; viewer: Viewer}) => {
  const {viewer} = opts
  const {db} = await getDb(viewer)

  return {
    db,
    getDb: async () => {
      const {db} = await getDb(viewer)
      return db
    },
  }
}

export const makePostgresMetaService = zFunction(
  zPgConfig.pick({databaseUrl: true}).extend({viewer: zViewer}),
  (opts): MetaService => {
    const getDeps = () => _getDeps(opts)
    const tables: MetaService['tables'] = {
      // customer: metaTable('customer', _getDeps(opts)),
      // Delay calling of __getDeps until later..
      connection: metaTable('connection', getDeps),
      integration: metaTable('integration', getDeps),
      connector_config: metaTable('connector_config', getDeps),
      pipeline: metaTable('pipeline', getDeps),
      event: metaTable('event', getDeps),
    }
    return {
      tables,
      searchCustomers: async ({keywords, ...rest}) => {
        const {db} = await _getDeps(opts)
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
        const {rows} = await db.execute(query)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rows.map((r) => camelCaseKeys(r) as CustomerResultRow)
      },
      searchIntegrations: async ({keywords, connectorNames, ...rest}) => {
        const {db} = await _getDeps(opts)
        const conditions = R.compact([
          connectorNames &&
            sql`connector_name = ANY(${sql.param(connectorNames)})`,
          keywords && sql`standard->>'name' ILIKE ${'%' + keywords + '%'}`,
        ])
        const where =
          conditions.length > 0
            ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
            : sql``
        const {rows} = await db.execute(
          applyLimitOffset(sql`SELECT * FROM integration ${where}`, rest),
        )
        return rows.map((r) => camelCaseKeys(r) as ZRaw['integration'])
      },

      findPipelines: async ({
        connectionIds,
        secondsSinceLastSync,
        includeDisabled,
      }) => {
        const {db} = await _getDeps(opts)
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
        const {rows} = await db.execute(sql`SELECT * FROM pipeline ${where}`)
        return rows.map((r) => camelCaseKeys(r))
      },
      listConnectorConfigInfos: async ({id, connectorName} = {}) => {
        const {db} = await _getDeps(opts)
        const {rows} = await db.execute(
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
        return rows.map((r) => camelCaseKeys(r))
      },
      findConnectionsMissingDefaultPipeline: async () => {
        const {db} = await _getDeps(opts)
        const {rows} = await db.execute<{id: Id['conn']}>(sql`
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
        return rows.map((r) => camelCaseKeys(r))
      },
      isHealthy: async (checkDefaultPostgresConnections = false) => {
        const {db} = await _getDeps({
          ...opts,
          // hardcoding to system viewer to avoid any authorization checks
          viewer: {role: 'system'},
        })

        const {rows} = await db.execute(sql`SELECT 1`)

        if (!rows.length || rows.length !== 1) {
          return {healthy: false, error: 'Main database is not healthy'}
        }

        // TODO:(@pellicceama) to use sql token rather than hard coding here.
        const {rows: top3DefaultPostgresConnections} = await db.execute(
          sql`SELECT id, settings->>'databaseUrl' as database_url FROM connection where id like 'conn_postgres_default_%' ORDER BY updated_at DESC LIMIT 3`,
        )

        if (checkDefaultPostgresConnections) {
          for (const connection of top3DefaultPostgresConnections) {
            if (!connection['database_url']) {
              continue
            }
            const connDb = drizzle(connection['database_url'] as string, {
              logger: __DEBUG__,
            })
            const {rows} = await connDb.execute(sql`SELECT 1`)
            if (!rows.length || rows.length !== 1) {
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
  getDeps: () => Deps,
): MetaTable<TID, T> {
  const table = sql.identifier(tableName)

  //  const sqlType = sql.type(zRaw[tableName])

  // TODO: Convert case from snake_case to camelCase
  return {
    list: async ({
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
      const {db} = await getDeps()
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
      const {rows} = await db.execute<T>(
        applyLimitOffset(sql`SELECT * FROM ${table} ${where}`, rest),
      )
      return rows.map((r) => camelCaseKeys(r) as T)
    },
    get: async (id) => {
      const {db} = await getDeps()
      const {rows} = await db.execute<T>(
        sql`SELECT * FROM ${table} where id = ${id}`,
      )
      return rows.map(camelCaseKeys)[0] as T | undefined
    },
    set: async (id, data) => {
      const {getDb} = await getDeps()
      // use getDb to workaround drizzle schema cache issue
      dbUpsertOne(await getDb(), tableName, snakeCaseKeys({...data, id}), {
        keyColumns: ['id'],
      })
    },
    patch: async (id, data) => {
      const {getDb} = await getDeps()
      // use getDb to workaround drizzle schema cache issue
      dbUpsertOne(await getDb(), tableName, snakeCaseKeys({...data, id}), {
        keyColumns: ['id'],
        shallowMergeJsonbColumns: true,
      })
    },
    delete: async (id) => {
      const {db} = await getDeps()
      await db.execute(sql`DELETE FROM ${table} WHERE id = ${id}`)
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
