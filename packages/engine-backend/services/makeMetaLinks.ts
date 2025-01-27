import type {
  AnyEntityPayload,
  ConnectionUpdateData,
  Id,
  IDS,
  OpHandlers,
  ZRaw,
} from '@openint/cdk'
import {extractId, handlersLink, IDS_INVERTED, makeId} from '@openint/cdk'
import type {ObjectPartialDeep} from '@openint/util'
import {deepMerge, R} from '@openint/util'
import type {MetaService, MetaTable} from './metaService'

// TODO: Validate connection before saving...
// metaStore and syncHelpers appear to be a bit circular relationship...
// So we cannot use the ParsedPipeline type. Consider improving this
// for the future

// Should the mapping of the StandardIntegration happen inside here?

export function makeMetaLinks(metaBase: MetaService) {
  type Res = Pick<
    ZRaw['connection'],
    'id' | 'connector_config_id' | 'customer_id'
  >
  type Pipe = Pick<
    ZRaw['pipeline'],
    'id' | 'source_id' | 'destination_id' | 'link_options'
  >

  const postSource = (opts: {src: Res}) => handle({connection: opts.src})

  const postDestination = (opts: {pipeline: Pipe; dest: Res}) =>
    handle({connection: opts.dest, pipeline: opts.pipeline})

  const persistIntegration = () => handle({})

  const handle = (...args: Parameters<typeof handlers>) =>
    handlersLink<AnyEntityPayload>({
      connUpdate: async (op) => {
        await handlers(...args).connUpdate(op)
        return op
      },
      stateUpdate: async (op) => {
        await handlers(...args).stateUpdate(op)
        return op
      },
      data: async (op) => {
        await handlers(...args).data(op)
        return op
      },
    })

  const handlers = ({
    pipeline,
    connection,
  }: {
    /** Used for state persistence. Do not pass in until destination handled event already */
    pipeline?: Pipe
    connection?: Res
  }) =>
    ({
      // TODO: make standard insitution and connection here...
      connUpdate: async (op: ConnectionUpdateData) => {
        if (op.id !== connection?.id) {
          console.warn(`Unexpected connection id ${op.id} != ${connection?.id}`)
          return
        }
        const {id, settings = {}, integration} = op
        const connectorName = extractId(connection.id)[1]
        console.log('[metaLink] connUpdate', {
          id,
          settings: R.keys(settings),
          integration,
          existingConnection: connection,
        })

        const integrationId = integration
          ? makeId('int', connectorName, integration.externalId)
          : undefined

        // Can we run this in one transaction?
        if (integration && integrationId) {
          // Technically requires elevated permissions...
          await patch('integration', integrationId, {
            id: integrationId,
            standard: integration.data,
          })
        }
        // Workaround for default connector configs such as `ccfg_plaid` etc which
        // do not exist in the database and would otherwise cause foreign key issue
        // Is it a hack? When there is no 3rd component of id, does that always
        // mean that the connector config does not in fact exist in database?
        const connectorConfigId =
          connection.connector_config_id &&
          extractId(connection.connector_config_id)[2] === ''
            ? undefined
            : connection.connector_config_id

        // Can we run this in one transaction?

        await patch('connection', id, {
          id,
          settings,
          // It is also an issue that Integration may not exist at the initial time of
          // connection establishing..
          connector_config_id: connectorConfigId,
          integration_id: integrationId,
          // maybe we should distinguish between setDefaults (from existingConnection) vs. actually
          // updating the values...
          customer_id: connection.customer_id,
        })
      },
      stateUpdate: async (op) => {
        console.log('[metaLink] stateUpdate', pipeline?.id, {
          sourceState: R.keys(op.sourceState ?? {}),
          destinationState: R.keys(op.destinationState ?? {}),
        })

        if (pipeline) {
          console.log('[metaLink] stateUpdate pipeline', pipeline.id)
          // Workaround for default pipeline such as `conn_postgres` etc which
          // does not exist in the database...
          const sourceId =
            pipeline.source_id && extractId(pipeline.source_id)[2] === ''
              ? undefined
              : pipeline.source_id
          const destinationId =
            pipeline.destination_id &&
            extractId(pipeline.destination_id)[2] === ''
              ? undefined
              : pipeline.destination_id
          const nowStr = new Date().toISOString()
          await patch('pipeline', pipeline.id, {
            source_state: op.sourceState,
            destination_state: op.destinationState,
            // Should be part of setDefaults...
            source_id: sourceId,
            destination_id: destinationId,
            id: pipeline.id,
            link_options: pipeline.link_options,
            last_sync_started_at: op.subtype === 'init' ? nowStr : undefined,
            // Idealy this should use the database timestamp if possible (e.g. postgres)
            // However we don't always know if db supports it (e.g. local files...)
            last_sync_completed_at:
              op.subtype === 'complete' ? nowStr : undefined,
          })
        }
      },
      data: async (op) => {
        // prettier-ignore
        const {data: {entity, entityName, id}} = op
        if (entityName !== IDS_INVERTED.int) {
          return
        }
        console.log('[metaLink] patch', id, entity)
        await patch(
          'integration',
          id as Id['int'],
          entity as ZRaw['integration'],
        )
        // console.log(`[meta] Did update connection`, id, op.data)
      },
    }) satisfies OpHandlers<Promise<void>>

  // TODO: Dedupe with contextHelpers
  const patch = async <TTable extends keyof ZRaw>(
    tableName: TTable,
    id: Id[(typeof IDS)[TTable]],
    _patch: ObjectPartialDeep<ZRaw[TTable]>,
  ) => {
    if (Object.keys(_patch).length === 0) {
      return
    }
    const table: MetaTable = metaBase.tables[tableName]
    if (table.patch) {
      await table.patch(id, _patch)
    } else {
      const data = await table.get(id)
      console.log(`[patch] Will merge patch and data`, {_patch, data})
      await table.set(id, deepMerge(data ?? {}, _patch))
    }
  }

  return {
    postSource,
    postDestination,
    persistIntegration,
    handlers,
    patch,
  }
}
