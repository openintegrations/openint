/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type {DatabasePool} from 'slonik'
import {sql} from 'slonik'
import type {ConnectorServer} from '@openint/cdk'
import {handlersLink} from '@openint/cdk'
import {R, rxjs, snakeCase} from '@openint/util'
import type {postgresSchemas} from './def'
import {makePostgresClient, upsertByIdQuery} from './makePostgresClient'

// TODO: remove when we introduce dynamic column names
const agTableMappings = [
  {from: 'integration_ats_job', to: 'IntegrationATSJob'},
  {from: 'integration_ats_candidate', to: 'IntegrationATSCandidate'},
  {from: 'integration_ats_opening', to: 'IntegrationATSOpening'},
  {from: 'integration_ats_offer', to: 'IntegrationATSOffer'},
  {from: 'integration_connection', to: 'IntegrationConnection'},
]

async function setupTable({
  pool,
  schema: _schema,
  tableName: _tableName,
}: {
  pool: DatabasePool
  schema?: string
  tableName: string
}) {
  const schema = snakeCase(_schema)
  const tableName = snakeCase(_tableName)
  // TODO: remove when we introduce dynamic column names
  const mappedTableName =
    agTableMappings.find((mapping) => mapping.from === tableName)?.to ||
    tableName
  const table = sql.identifier(
    schema ? [schema, mappedTableName] : [mappedTableName],
  )

  // Note: Ideally we would create these for AG but we're not doing so as slonik does not support raw queries
  // and also these tables are precreated in staging
  // import { raw } from 'slonik-sql-tag-raw';
  // const extraPerEntityColumns = {
  //   'IntegrationATSJob': ['external_job_id VARCHAR'],
  //   'IntegrationATSCandidate': ['opening_external_id VARCHAR', 'candidate_name VARCHAR'],
  //   'IntegrationATSOpening': ['opening_external_id VARCHAR', 'job_id VARCHAR'],
  //   'IntegrationATSOffer': ['opening_external_id VARCHAR', 'candidate_name VARCHAR'],
  // }
  // const extraColumns = extraPerEntityColumns[mappedTableName as keyof typeof extraPerEntityColumns]?.join(',\n      ') ?? ''
  // this does not work...
  // const extraColumnsSql = extraColumns.length > 0 ? sql`, ${raw(extraColumns)}` : sql``;

  await pool.query(sql`
    CREATE TABLE IF NOT EXISTS ${table} (
      "connectionId" VARCHAR NOT NULL,
      id VARCHAR NOT NULL,
      "clientId" VARCHAR,
      "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
      "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
      "connectorName" VARCHAR GENERATED ALWAYS AS (split_part(("connectionId")::text, '_'::text, 2)) STORED NOT NULL,
      CONSTRAINT ${sql.identifier([`pk_${mappedTableName}`])} PRIMARY KEY (
        "id"),
      unified jsonb,
      raw jsonb DEFAULT '{}'::jsonb NOT NULL,
      "isOpenInt" boolean
    );
  `)
  // NOTE: Should we add org_id?
  // NOTE: Rename `unified` to `unified` and `raw` to `raw` or `remote` or `original`
  // NOTE: add prefix check would be nice
  for (const col of [
    'id',
    'connectionId',
    // 'connectorName', // TODO: remove when we introduce dynamic column names
    'createdAt',
    'updatedAt',
    'clientId',
  ]) {
    await pool.query(sql`
      CREATE INDEX IF NOT EXISTS ${sql.identifier([
        `${mappedTableName}_${col}`,
      ])} ON ${table} (${sql.identifier([col])});
    `)
  }
}

export const postgresServer = {
  // sourceSync removed: https://github.com/openintegrations/openint/pull/64/commits/20ef41123b1f72378e312c2c3114c462423e16e7

  destinationSync: ({endUser, source, settings: {databaseUrl}}) => {
    console.log('[destinationSync] Will makePostgresClient', {
      // databaseUrl,
      // migrationsPath: __dirname + '/migrations',
      endUser,
    })
    // TODO: Probably need to require these sql files to work... turn them into js files

    const {getPool} = makePostgresClient({
      databaseUrl,
      migrationsPath: __dirname + '/migrations',
      migrationTableName: '_migrations',
    })
    let batches: Record<string, Array<{id: string; [k: string]: unknown}>> = {}

    const migrationRan: Record<string, boolean> = {}
    async function runMigration(pool: DatabasePool, tableName: string) {
      if (migrationRan[tableName]) {
        return
      }
      console.log('will run migration for', tableName)
      migrationRan[tableName] = true
      // Where do we want to put data? Not always public...
      await setupTable({pool, tableName})
    }

    let agConnectionCreatedForResource = false

    return handlersLink({
      data: async (op) => {
        const {
          data: {id, entityName, ...data},
        } = op
        const tableName = entityName
        const batch = batches[tableName] ?? []
        batches[tableName] = batch

        const rowToInsert: Record<string, unknown> = {
          // This is really not ideal. Maybe this should be a resource level seteting
          // about how we want to "normalize"?
          // Or be provided by the Operation itself?
          ...(typeof data.entity === 'object' &&
          data.entity &&
          'raw' in data.entity
            ? {...data.entity}
            : {raw: data.entity}),
          id,
          clientId: endUser?.id ?? null,
          // connectionId: source?.id,
          connectionId: source?.id + '',
          isOpenInt: true,
        }

        const isAgMode =
          // orgs in openint clerk app
          endUser?.orgId === 'org_2nJZrA4Dk8i3wszhm6PsP3M2Vwy' ||
          endUser?.orgId === 'org_2lcCCimyICKI8cpPNQt195h5zrP' ||
          endUser?.orgId === 'org_2ms9FdeczlbrDIHJLcwGdpv3dTx' ||
          // orgs in ag app
          endUser?.orgId === 'org_2pBMOEKROMpNR7zckHtah4ebxAk' ||
          endUser?.orgId === 'org_2pBM0RSOqs5QzZi40A73hZ5aTjD'

        // TODO: Remove when we have support for links custom upserts
        if (isAgMode) {
          console.log('Inserting record for AG')
          if (tableName === 'IntegrationAtsJob') {
            rowToInsert['external_job_id'] = data.entity?.raw?.id || ''
          } else if (tableName === 'IntegrationAtsCandidate') {
            // TODO: AG is renaming this to candidate_external_id 
            // when they migrate their schema this should be candidate_external_id = data.entity?.raw?.id
            rowToInsert['opening_external_id'] = data.entity?.raw?.id || ''
            rowToInsert['candidate_name'] =
              data.entity?.raw?.first_name +
                ' ' +
                data.entity?.raw?.last_name || ''
          } else if (tableName === 'IntegrationAtsOpening') {
            rowToInsert['opening_external_id'] =
              data.entity?.raw?.opening_id || ''
            rowToInsert['job_id'] = data.entity?.raw?.job_id || ''
          } else if (tableName === 'IntegrationAtsOffer') {
            rowToInsert['offer_external_id'] = data.entity?.raw?.id || ''
            rowToInsert['opening_external_id'] = data.entity?.raw?.opening?.id || ''
            // field does not exist in the offer object
            rowToInsert['candidate_name'] = ''
          }

          if (!agConnectionCreatedForResource) {
            console.log('will create ag connection record for', entityName)
            const integrationConnectionRecord = {
              id: source?.id + '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              clientId: endUser?.id,
              source: 'OpenInt',
              profile: 'Ats',
              provider: source?.connectorName, // lever, greenhouse etc
              label: source?.connectorName, // lever, greenhouse etc
            }
            const query = await upsertByIdQuery(
              'IntegrationConnection',
              [integrationConnectionRecord],
              {
                primaryKey: ['id'],
              },
            )

            if (!query) {
              console.log(
                '[destinationSync] Could not AG create integration connection record',
              )
              return
            }

            // replace all instances of "Ats" with "ATS"
            const agMappings = [
              {from: 'client_id', to: 'clientId'},
              {from: 'created_at', to: 'createdAt'},
              {from: 'updated_at', to: 'updatedAt'},
              {from: 'is_open_int', to: 'isOpenInt'},
              {from: 'connection_id', to: 'connectionId'},
              ...agTableMappings,
            ]
            let sqlQuery = query.sql
            // Use a for loop to replace all camelCase table and column names with snake_case
            for (const mapping of agMappings) {
              const regex = new RegExp(`"${mapping.from}"`, 'g')
              sqlQuery = sqlQuery.replace(regex, `"${mapping.to}"`)
            }

            const pool = await getPool()
            await pool.query({
              sql: sqlQuery,
              values: query.values,
              type: query.type,
            })
            agConnectionCreatedForResource = true
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        batch.push(rowToInsert as any)
        return rxjs.of(op)
      },
      commit: async (op) => {
        const size = R.values(batches)
          .map((b) => b.length)
          .reduce((a, b) => a + b, 0)
        if (size === 0) {
          return op
        }
        const pool = await getPool()
        await Promise.all(
          Object.keys(batches).map((eName) => runMigration(pool, eName)),
        )

        console.log(`[postgres] Will commit ${size} entities`)
        await pool.transaction((client) =>
          Promise.all(
            R.pipe(
              batches,
              R.toPairs,
              R.map(([eName, batch]) =>
                upsertByIdQuery(eName, batch, {
                  primaryKey: [
                    'id',
                    // TODO: remove when we introduce dynamic column names
                    // 'connectionId'
                  ],
                }),
              ),
              R.compact,
              R.map((query) => {
                // TODO: remove when we introduce dynamic column names
                // Replace all instances inconsistent table and column names before execution
                const agMappings = [
                  {from: 'client_id', to: 'clientId'},
                  {from: 'created_at', to: 'createdAt'},
                  {from: 'updated_at', to: 'updatedAt'},
                  {from: 'is_open_int', to: 'isOpenInt'},
                  {from: 'connection_id', to: 'connectionId'},
                  ...agTableMappings,
                ]

                let sqlQuery = query.sql
                // Use a for loop to replace all camelCase table and column names with snake_case
                for (const mapping of agMappings) {
                  const regex = new RegExp(`"${mapping.from}"`, 'g')
                  sqlQuery = sqlQuery.replace(regex, `"${mapping.to}"`)
                }

                // replace all instances of "Ats" with "ATS"
                sqlQuery = sqlQuery.replace(/Ats/g, 'ATS')

                // console.log('sqlQuery', sqlQuery);
                return client.query({
                  sql: sqlQuery,
                  values: query.values,
                  type: query.type,
                })
              }),
            ),
          ),
        )
        batches = {}
        console.log(`[postgres] Did commit ${size} entities`)
        return op
      },
    })
  },
} satisfies ConnectorServer<typeof postgresSchemas>

export default postgresServer
