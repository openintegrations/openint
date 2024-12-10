import {clerkClient} from '@clerk/nextjs/server'
import type {Link as FetchLink} from '@opensdks/runtime'
import type {
  AnyEntityPayload,
  ConnectionUpdate,
  CustomerId,
  Destination,
  Id,
  Link,
  Source,
  StreamsV1,
  StreamsV2,
} from '@openint/cdk'
import {
  bankingLink,
  logLink,
  makeId,
  prefixConnectorNameLink,
  singleTableLink,
  sync,
} from '@openint/cdk'
import type {z} from '@openint/util'
import {rxjs} from '@openint/util'
// Amadeo Q: how do I make the atsLink part of the openint/cdk? is there some sort of release process?
import {unifiedAtsLink} from '../../../unified/unified-ats'
import {unifiedCrmLink} from '../../../unified/unified-crm'
import {agLink} from '../../custom-links/agLink'
import {inngest} from '../events'
import type {zSyncOptions} from '../types'
import type {AuthProvider} from './AuthProvider'
import type {
  _ConnectionExpanded,
  _ConnectorConfig,
  _PipelineExpanded,
  makeDBService,
} from './dbService'
import type {makeMetaLinks} from './makeMetaLinks'
import type {MetaService} from './metaService'

export function makeSyncService({
  metaLinks,
  metaService,
  getPipelineExpandedOrFail,
  getConnectionExpandedOrFail,
  getFetchLinks,
  authProvider,
}: {
  metaService: MetaService
  metaLinks: ReturnType<typeof makeMetaLinks>
  getPipelineExpandedOrFail: ReturnType<
    typeof makeDBService
  >['getPipelineExpandedOrFail']
  getConnectionExpandedOrFail: ReturnType<
    typeof makeDBService
  >['getConnectionExpandedOrFail']
  getFetchLinks: (conn: _ConnectionExpanded) => FetchLink[]
  authProvider: AuthProvider
}) {
  async function ensurePipelinesForConnection(connId: Id['conn']) {
    console.log('[ensurePipelinesForConnection]', connId)
    const pipelines = await metaService.findPipelines({connectionIds: [connId]})
    const conn = await getConnectionExpandedOrFail(connId)
    const createdIds: Array<Id['pipe']> = []
    let defaultDestId = conn.connectorConfig?.defaultPipeOut?.destination_id
    if (!defaultDestId) {
      const org = await authProvider.getOrganization(conn.connectorConfig.orgId)
      if (org.publicMetadata.database_url) {
        const dCcfgId = makeId('ccfg', 'postgres', 'default_' + org.id)
        defaultDestId = makeId('conn', 'postgres', 'default_' + org.id)
        await metaLinks.patch('connector_config', dCcfgId, {
          orgId: org.id,
          // Defaulting to disabled to not show up for end users as we don't have another way to filter them out for now
          // Though technically incorrect as we will later pause syncing for disabled connectors
          disabled: true,
          displayName: 'Default Postgres Connector for sync',
        })
        console.log('Created default connector config', dCcfgId)
        // Do we actually need to store this?
        await metaLinks.patch('connection', defaultDestId, {
          connectorConfigId: dCcfgId,
          // Should always snake_case here. This is also not typesafe...
          settings: {
            databaseUrl: org.publicMetadata.database_url,
            migrateTables: org.publicMetadata.migrate_tables,
          },
        })
        console.log('Created default connection', defaultDestId)
      }
    }

    if (
      defaultDestId &&
      !pipelines.some((p) => p.destinationId === defaultDestId)
    ) {
      const pipelineId = makeId('pipe', 'default_out_' + conn.id)
      createdIds.push(pipelineId)
      console.log(
        `[sync-serivce] Creating default outgoing pipeline ${pipelineId} for ${connId} to ${defaultDestId}`,
      )

      await metaLinks.patch('pipeline', pipelineId, {
        sourceId: connId,
        destinationId: defaultDestId,
      })
    }

    const defaultSrcId = conn.connectorConfig?.defaultPipeIn?.source_id
    if (defaultSrcId && !pipelines.some((p) => p.sourceId === defaultSrcId)) {
      const pipelineId = makeId('pipe', 'default_in_' + conn.id)
      createdIds.push(pipelineId)
      console.log(
        `[sync-serivce] Creating default incoming pipeline ${pipelineId} for ${connId} from ${defaultSrcId}`,
      )
      await metaLinks.patch('pipeline', pipelineId, {
        sourceId: defaultSrcId,
        destinationId: connId,
      })
    }
    return createdIds
  }

  // NOTE: Would be great to avoid the all the round tripping with something like a data loader.
  // or possibly drizzle orm
  const getPipelinesForConnection = (connId: Id['conn']) =>
    metaService
      .findPipelines({connectionIds: [connId]})
      .then((pipes) =>
        Promise.all(pipes.map((pipe) => getPipelineExpandedOrFail(pipe.id))),
      )

  // NOTE: Stop the hard-coding some point!
  // - connector metadata should be able to specify the set of transformations desired
  // - connector config should additionally be able to specify transformations!
  // connectors shall include `config`.
  // In contrast, connection shall include `external`
  // We do need to figure out which secrets to tokenize and which one not to though
  // Perhaps the best way is to use `secret_` prefix? (think how we might work with vgs)
  const getLinksForPipeline = ({
    source,
    destination,
    links, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: _PipelineExpanded): Array<Link<any>> => {
    const allLinks = [
      ...links,
      ...[
        ...(source.connectorConfig.defaultPipeOut?.links ?? []),
        ...(destination.connectorConfig.defaultPipeIn?.links ?? []),
      ],
    ]
    // console.log('getLinksForPipeline', {source, allLinks, destination})
    return [
      ...allLinks.map((l) => {
        // TODO: make me less hard-coded.
        switch (l) {
          case 'unified_banking':
            return bankingLink({source})
          case 'prefix_connector_name':
            return prefixConnectorNameLink({source})
          case 'unified_ats':
            return unifiedAtsLink({source})
          case 'single_table':
            return singleTableLink({source})
          case 'unified_crm':
            return unifiedCrmLink({source})
          case 'custom_link_ag':
            return agLink({source})
          default:
            throw new Error(`Unknown link ${l}`)
        }
      }),
      logLink({prefix: 'preDest'}),
    ]
    // // console.log('getLinksForPipeline', {source, links, destination})
    // if (destination.connectorConfig.connector.name === 'beancount') {
    //   return [
    //     ...links,
    //     mapStandardEntityLink(source),
    //     addRemainderByDateLink as Link, // What about just the addRemainder plugin?
    //     // renameAccountLink({
    //     //   Ramp: 'Ramp/Posted',
    //     //   'Apple Card': 'Apple Card/Posted',
    //     // }),
    //     mapAccountNameAndTypeLink() as Link,
    //     logLink({prefix: 'preDest', verbose: true}),
    //   ]
    // }
    // if (destination.connectorConfig.connector.name === 'alka') {
    //   return [
    //     ...links,
    //     // logLink({prefix: 'preMap'}),
    //     mapStandardEntityLink(source),
    //     // prefixIdLink(src.connector.name),
    //     logLink({prefix: 'preDest'}),
    //   ]
    // }
    // if (source.connectorConfig.connector.name === 'postgres') {
    //   return [...links, logLink({prefix: 'preDest'})]
    // }
    // return [
    //   ...links,
    //   // logLink({prefix: 'preMapStandard', verbose: true}),
    //   mapStandardEntityLink(source),
    //   Rx.map((op) =>
    //     op.type === 'data' &&
    //     destination.connectorConfig.connector.name !== 'postgres'
    //       ? R.identity({
    //           ...op,
    //           data: {
    //             ...op.data,
    //             entity: {
    //               standard: op.data.entity,
    //               external: (op.data as EntityPayloadWithRaw).raw,
    //             },
    //           },
    //         })
    //       : op,
    //   ),
    //   logLink({prefix: 'preDest'}),
    // ]
  }

  const sourceSync = ({
    src,
    state,
    customer,
    streams,
    opts,
  }: {
    src: _ConnectionExpanded
    state: unknown
    customer?: {id: CustomerId} | null | undefined
    streams?: StreamsV1 | StreamsV2
    opts: {fullResync?: boolean | null}
  }) => {
    const defaultSource$ = () =>
      src.connectorConfig.connector.sourceSync?.({
        customer,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        instance: src.connectorConfig.connector.newInstance?.({
          config: src.connectorConfig.config,
          settings: src.settings,
          fetchLinks: getFetchLinks(src),
          onSettingsChange: () => {},
        }),
        config: src.connectorConfig.config,
        settings: src.settings,
        // Maybe we should rename `options` to `state`?
        // Should also make the distinction between `config`, `settings` and `state` much more clear.
        // Undefined causes crash in Plaid provider due to destructuring, Think about how to fix it for reals
        state: opts.fullResync ? {} : state,
        streams: streams ?? src.connectorConfig.defaultPipeOut?.streams ?? {},
      })

    // const verticalSources$ = () => {
    //   const connector = src.connectorConfig.connector
    //   const helpers = connHelpers(connector.schemas)
    //   const primaryKey = connector.streams?.$defaults.primaryKey?.split('.') as
    //     | [string]
    //     | undefined

    //   const getId = (e: any) => {
    //     const id = primaryKey && R.pathOr(e, primaryKey, undefined)
    //     if (!id) {
    //       console.error('object missing primary key', primaryKey, e)
    //       throw new Error(`Primary key missing: ${primaryKey}`)
    //     }
    //     return `${id}`
    //   }
    //   const settingsSub = new rxjs.Subject<Array<(typeof helpers)['_opType']>>()

    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //   const instance = connector.newInstance?.({
    //     config: src.connectorConfig.config,
    //     settings: src.settings,
    //     onSettingsChange: (newSettings) => {
    //       // extId is technically redundant... but we have yet to define the primaryKey attribute for settings
    //       src.settings = newSettings
    //       settingsSub.next([
    //         helpers._opRes(extractId(src.id)[2], {settings: newSettings}),
    //       ])
    //     },
    //   })

    //   async function* iterateEntities() {
    //     if (!primaryKey) {
    //       return
    //     }

    //     // TODO: Implement incremental sync...
    //     for (const [vertical, schemas] of objectEntries(
    //       connector.schemas.verticals ?? {},
    //     )) {
    //       for (const name of objectKeys(schemas ?? {})) {
    //         const res = await connector.verticals?.[vertical]?.list?.(
    //           instance,
    //           name as never,
    //           {limit: 1000},
    //         )
    //         if (!res?.items.length) {
    //           continue
    //         }
    //         yield res.items.map((e) =>
    //           helpers._opData(`${vertical}.${name}`, getId(e), e),
    //         )
    //       }
    //     }
    //   }

    //   return settingsSub
    //     .pipe(Rx.mergeWith(rxjs.from(iterateEntities())))
    //     .pipe(Rx.mergeMap((ops) => rxjs.from([...ops, helpers._op('commit')])))
    // }

    return rxjs.concat(
      defaultSource$() ?? rxjs.EMPTY,
      // verticalSources$()
    )
  }

  const _syncPipeline = async (
    pipeline: _PipelineExpanded,
    opts: z.infer<typeof zSyncOptions> & {
      org?: {webhook_url?: string | null}
      source$?: Source<AnyEntityPayload>
      /**
       * Trigger the default sourceSync after source$ exhausts
       * TODO: #inngestMe This is where we can fire off a request to syncPipeline so it happens async
       */
      source$ConcatDefault?: boolean
      destination$$?: Destination
    } = {},
  ) => {
    console.log('[syncPipeline]', pipeline)
    const {source: src, links, destination: dest, watch, ...pipe} = pipeline
    // TODO: Should we introduce customerId onto the pipeline itself?
    const customerId = src.customerId ?? dest.customerId
    const customer = customerId ? {id: customerId} : null

    // TODO: Maybe not the best place for this? Think where clerkClient should live
    const org =
      opts.org ??
      (await clerkClient.organizations
        .getOrganization({
          organizationId: src.connectorConfig.orgId,
        })
        .then((r) => r.publicMetadata as {webhook_url?: string | null}))

    // console.log('[_syncPipeline] pipe sourceState', pipe.id, pipe.sourceState)

    const _source$ = sourceSync({
      opts,
      src,
      state: pipe.sourceState,
      customer,
      streams:
        pipeline.streams ??
        pipeline.source.connectorConfig.defaultPipeOut?.streams ??
        undefined,
    })

    const source$ = opts.source$
      ? opts.source$ConcatDefault
        ? rxjs.concat(opts.source$, _source$)
        : opts.source$
      : _source$

    const destination$$ =
      opts.destination$$ ??
      dest.connectorConfig.connector.destinationSync?.({
        source: {id: src.id, connectorName: src.connectorConfig.connector.name},
        customer: {
          id: customer?.id as CustomerId,
          orgId: pipeline.source.connectorConfig.orgId,
        },
        config: dest.connectorConfig.config,
        settings: dest.settings,
        // Undefined causes crash in Plaid provider due to destructuring, Think about how to fix it for reals
        state: opts.fullResync ? {} : pipe.destinationState,
      })

    if (!source$) {
      throw new Error(`${src.connectorConfig.connector.name} missing source`)
    }
    if (!destination$$) {
      throw new Error(
        `${dest.connectorConfig.connector.name} missing destination`,
      )
    }
    await metaLinks
      .handlers({pipeline})
      .stateUpdate({type: 'stateUpdate', subtype: 'init'})
    await sync({
      // Raw Source, may come from fs, firestore or postgres
      source: source$.pipe(
        // logLink({prefix: 'postSource', verbose: true}),
        metaLinks.postSource({src}),
      ),
      links: getLinksForPipeline?.(pipeline), // ?? links,
      // WARNING: It is insanely unclear to me why moving `metaLinks.link`
      // to after connector.destinationSync makes all the difference.
      // When syncing from firebase with a large number of docs,
      // we always seem to stop after 1600 or so documents.
      // I already checked this is because metaLinks.link runs a async comment
      // even delay(100) introduces issues.
      // It's worth trying to reproduce this with say a simple counter source and see if
      // it happens...
      destination: rxjs.pipe(
        destination$$,
        metaLinks.postDestination({pipeline, dest}),
      ),
      watch,
    }).finally(() =>
      metaLinks
        .handlers({pipeline})
        .stateUpdate({type: 'stateUpdate', subtype: 'complete'}),
    )

    await inngest.send({
      name: 'sync.completed',
      data: {
        pipeline_id: pipeline.id,
        source_id: src.id,
        destination_id: dest.id,
        customer_id: customerId,
      },
      user: {webhook_url: org?.webhook_url || ''},
    })
  }

  const _syncConnectionUpdate = async (
    int: _ConnectorConfig,
    {
      customerId: userId,
      settings,
      integration,
      ...connUpdate
    }: ConnectionUpdate<AnyEntityPayload, {}>,
  ) => {
    console.log('[_syncConnectionUpdate]', int.id, {
      userId,
      settings,
      integration,
      ...connUpdate,
    })
    const id = makeId(
      'conn',
      int.connector.name,
      connUpdate.connectionExternalId,
    )
    await metaLinks
      .handlers({
        connection: {id, connectorConfigId: int.id, customerId: userId},
      })
      .connUpdate({type: 'connUpdate', id, settings, integration})

    // TODO: This should be happening async
    if (!connUpdate.source$ && !connUpdate.triggerDefaultSync) {
      console.log(
        `[_syncConnectionUpdate] Returning early skip syncing pipelines for connection id ${id} and source ${connUpdate.source$} with triggerDefaultSync ${connUpdate.triggerDefaultSync}`,
      )
      return id
    }

    await ensurePipelinesForConnection(id)
    const pipelines = await getPipelinesForConnection(id)

    console.log('_syncConnectionUpdate existingPipes.len', pipelines.length)
    await Promise.all(
      pipelines.map(async (pipe) => {
        await _syncPipeline(pipe, {
          source$: connUpdate.source$,
          source$ConcatDefault: connUpdate.triggerDefaultSync,
        })
      }),
    )
    return id
  }

  return {
    _syncPipeline,
    _syncConnectionUpdate,
    sourceSync,
    ensurePipelinesForConnection,
  }
}
