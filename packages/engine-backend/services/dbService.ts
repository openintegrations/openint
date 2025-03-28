import type {AnyConnectorImpl, Id, IDS, ZRaw} from '@openint/cdk'
import {extractId, zRaw} from '@openint/cdk'
import {TRPCError} from '@openint/trpc'
import type {ObjectPartialDeep} from '@openint/util'
import {deepMerge, z} from '@openint/util'
import {makeMetaLinks} from './makeMetaLinks'
import type {MetaService, MetaTable} from './metaService'

export type _ConnectorConfig = Awaited<
  ReturnType<ReturnType<typeof makeDBService>['getConnectorConfigOrFail']>
>
export type _PipelineExpanded = Awaited<
  ReturnType<ReturnType<typeof makeDBService>['getPipelineExpandedOrFail']>
>
export type _ConnectionExpanded = Awaited<
  ReturnType<ReturnType<typeof makeDBService>['getConnectionExpandedOrFail']>
>

export function makeDBService({
  metaService,
  connectorMap,
}: {
  metaService: MetaService
  connectorMap: Record<string, AnyConnectorImpl>
}) {
  // TODO: Escalate to workspace level permission so it works for customers
  // TODO: Consider giving customers no permission at all?
  // It really does feel like we need some internal GraphQL for this...
  // Except different entities may still need to be access with different permissions...
  const getConnectorOrFail = (id: Id['ccfg'] | Id['conn']) => {
    const connectorName = extractId(id)[1]
    const connector = connectorMap[connectorName]
    if (!connector) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Cannot find connector for ${id}`,
      })
    }
    return connector
  }

  // TODO: Replace other getOrFail with this
  // TODO: Abstract this into a wrapper around metaService
  // so it can be used by other files such as metaLinks too
  const get = async <TTable extends keyof ZRaw>(
    tableName: TTable,
    id: Id[(typeof IDS)[TTable]],
  ) => {
    const table: MetaTable = metaService.tables[tableName]
    const data = await table.get(id)
    return data ? (zRaw[tableName].parse(data) as ZRaw[TTable]) : null
  }
  const getOrFail = async <TTable extends keyof ZRaw>(
    tableName: TTable,
    id: Id[(typeof IDS)[TTable]],
  ) => {
    const data = await get(tableName, id)
    if (!data) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `[db] ${tableName}: ${id} not found`,
      })
    }
    return data
  }
  const list = async <TTable extends keyof ZRaw>(
    tableName: TTable,
    ...args: Parameters<MetaTable['list']>
  ) => {
    const table: MetaTable = metaService.tables[tableName]
    const results = await table.list(...args)
    return results.map((r) => zRaw[tableName].parse(r) as ZRaw[TTable])
  }

  const patch = async <TTable extends keyof ZRaw>(
    tableName: TTable,
    id: Id[(typeof IDS)[TTable]],
    _patch: ObjectPartialDeep<ZRaw[TTable]>,
  ) => {
    // TODO: Validate connectorConfig.config and connection.settings
    if (Object.keys(_patch).length === 0) {
      return
    }
    let schema: z.AnyZodObject = zRaw[tableName]


    if (tableName === 'connector_config') {
      // The typing here isn't perfect. We want to make sure we are
      // overriding not just extending with arbitary properties
      schema = (schema as (typeof zRaw)['connector_config']).extend({
        // This should be an override...
        config:
          getConnectorOrFail(id as Id['ccfg']).schemas.connectorConfig ??
          z.object({}).nullish(),
        // TODO: Should validate a consistently
      })
    } else if (tableName === 'connection') {
      schema = (schema as (typeof zRaw)['connection']).extend({
        // This should be an override...
        settings:
          getConnectorOrFail(id as Id['conn']).schemas.connectionSettings ??
          z.object({}).nullish(),
      })
    } else if (tableName === 'pipeline') {
      // TODO: How do we validate if source or destination id is not provided?
      if ('sourceId' in _patch) {
        schema = (schema as (typeof zRaw)['pipeline']).extend({
          // This should be an override...
          sourceState:
            getConnectorOrFail(_patch.sourceId!).schemas.sourceState ??
            z.object({}).nullish(),
        })
      } else if ('destinationId' in _patch) {
        schema = (schema as (typeof zRaw)['pipeline']).extend({
          // This should be an override...
          destinationState:
            getConnectorOrFail(_patch.destinationId!).schemas
              .destinationState ?? z.object({}).nullish(),
        })
      }
    }
    const table: MetaTable = metaService.tables[tableName]
    if (table.patch) {
      const dataToPatch = zRaw[tableName].deepPartial().parse(_patch)
      // console.log(`[patch] Will patch`, {id, _patch, dataToPatch})
      await table.patch(id, dataToPatch)
    } else {
      const data = await table.get(id)

      // console.log(`[patch] Will merge patch and data`, {_patch, data})
      await table.set(id, zRaw[tableName].parse(deepMerge(data ?? {}, _patch)))
    }
  }

  // TODO: Implement native patchReturning in postgres?
  const patchReturning = async <TTable extends keyof ZRaw>(
    tableName: TTable,
    id: Id[(typeof IDS)[TTable]],
    _patch: ObjectPartialDeep<ZRaw[TTable]>,
  ) => {
    await patch(tableName, id, _patch)
    return getOrFail(tableName, id)
  }

  const getConnectorConfigInfoOrFail = (id: Id['ccfg'], skipValidation = false) =>
    metaService.listConnectorConfigInfos({id}).then((ints) => {
      if (!ints[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `ccfg info not found: ${id}`,
        })
      }
      return skipValidation ? ints[0] : zRaw.connector_config.parse(ints[0])
    })

  const getConnectorConfigOrFail = (id: Id['ccfg'], skipValidation = false) =>
    metaService.tables.connector_config.get(id).then((_ccfg) => {
      if (!_ccfg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `ccfg not found: ${id}`,
        })
      }
      const int = zRaw.connector_config.parse(_ccfg)
      const connector = getConnectorOrFail(int.id)
      const config: {} = skipValidation
        ? int.config
        : connector.schemas.connectorConfig?.parse(int.config)
      return {...int, connector, config}
    })

  const getIntegrationOrFail = (id: Id['int'], skipValidation = false) =>
    metaService.tables.integration.get(id).then(async (ins) => {
      if (!ins) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `int not found: ${id}`,
        })
      }
      // TODO: Fix the root cause and ensure we always have integration.standard here
      if (!ins.standard?.name) {
        const connectorName = extractId(ins.id)[1]
        const provider = connectorMap[connectorName]
        ins.standard = provider?.standardMappers?.integration?.(ins.external)
        await metaLinks.patch('integration', ins.id, {standard: ins.standard})
      }
      return skipValidation ? ins : zRaw.integration.parse(ins)
    })
  const getConnectionOrFail = (id: Id['conn'], skipValidation = false) =>
    metaService.tables.connection.get(id).then((conn) => {
      if (!conn) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `conn not found: ${id}`,
        })
      }
      if (!skipValidation) {
        return zRaw.connection.parse(conn)
      }
      return conn
    })
  const getPipelineOrFail = (id: Id['pipe'], skipValidation = false) =>
    metaService.tables.pipeline.get(id).then((pipe) => {
      if (!pipe) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `pipe not found: ${id}`,
        })
      }
      return skipValidation ? pipe : zRaw.pipeline.parse(pipe)
    })

  const getConnectionExpandedOrFail = (id: Id['conn'], skipValidation = false) =>
    getConnectionOrFail(id).then(async (conn) => {
      const connectorConfig = await getConnectorConfigOrFail(
        conn.connectorConfigId,
        skipValidation,
      )
      const settings: {} = skipValidation
        ? conn.settings
        : connectorConfig.connector.schemas.connectionSettings?.parse(
            conn.settings,
          )
      const integration = conn.integrationId
        ? await getIntegrationOrFail(conn.integrationId, skipValidation)
        : undefined
      return {...conn, connectorConfig, settings, integration}
    })

  const getPipelineExpandedOrFail = (id: Id['pipe'], skipValidation = false) =>
    getPipelineOrFail(id).then(async (pipe) => {
      const [source, destination] = await Promise.all([
        getConnectionExpandedOrFail(pipe.sourceId!, skipValidation),
        getConnectionExpandedOrFail(pipe.destinationId!, skipValidation),
      ])
      // if (
      //   pipe.sourceState != null &&
      //   !source.connectorConfig.connector.schemas.sourceState
      // ) {
      //   throw new TRPCError({
      //     code: 'BAD_REQUEST',
      //     message: `Source state is not supported for ${source.connectorConfig.connector.name}`,
      //   })
      // }
      // if (
      //   pipe.destinationState != null &&
      //   !destination.connectorConfig.connector.schemas.destinationState
      // ) {
      //   throw new TRPCError({
      //     code: 'BAD_REQUEST',
      //     message: `destinationState is not supported for ${destination.connectorConfig.connector.name}`,
      //   })
      // }
      const sourceState: {} = skipValidation
        ? pipe.sourceState
        : (
            source.connectorConfig.connector.schemas.sourceState ?? z.unknown()
          ).parse(pipe.sourceState)
      const destinationState: {} = skipValidation
        ? pipe.destinationState
        : (
            destination.connectorConfig.connector.schemas.destinationState ??
            z.unknown()
          ).parse(pipe.destinationState)
      // const links = R.pipe(
      //   rest.linkOptions ?? pipeline?.linkOptions ?? [],
      //   R.map((l) =>
      //     typeof l === 'string'
      //       ? linkMap?.[l]?.(undefined)
      //       : linkMap?.[l[0]]?.(l[1]),
      //   ),
      //   R.compact,
      // )
      return {
        ...pipe,
        source,
        destination,
        sourceState,
        destinationState,
        links: [],
        watch: false, // TODO: Fix me
      }
    })
  // TODO: Refactor to avoid the double roundtrip
  const listConnectorConfigs = () =>
    metaService.tables.connector_config
      .list({})
      .then((ccfgs) =>
        Promise.all(ccfgs.map((ccfg) => getConnectorConfigOrFail(ccfg.id))),
      )

  const metaLinks = makeMetaLinks(metaService)

  return {
    metaService,
    metaLinks,
    getConnectorOrFail,
    getConnectorConfigInfoOrFail,
    getConnectorConfigOrFail,
    getConnectionOrFail,
    getPipelineOrFail,
    getConnectionExpandedOrFail,
    getPipelineExpandedOrFail,
    listConnectorConfigs,
    // DB methods really should be moved to a separate file
    get,
    getOrFail,
    list,
    patch,
    patchReturning,
  }
}
