import type {ResourceUpdate, ZRaw} from '@openint/cdk'
import {
  extractId,
  getRemoteContext,
  makeId,
  sync,
  zCheckResourceOptions,
  zCustomerId,
  zId,
  zPassthroughInput,
  zRaw,
} from '@openint/cdk'
import {TRPCError} from '@openint/trpc'
import {joinPath, makeUlid, R, Rx, rxjs, z} from '@openint/util'
import {inngest} from '../events'
import {parseWebhookRequest} from '../parseWebhookRequest'
import {zSyncOptions} from '../types'
import {protectedProcedure, remoteProcedure, trpc} from './_base'
import {zListParams} from './_schemas'

export {type inferProcedureInput} from '@openint/trpc'

const tags = ['Core']

async function performConnectionCheck(ctx: any, connId: string, opts: any) {
  const remoteCtx = await getRemoteContext({
    ...ctx,
    remoteConnectionId: connId,
  })
  const {connectorConfig: int, ...reso} =
    await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)

  let resoUpdate = await int.connector.checkResource?.({
    settings: remoteCtx.remote.settings,
    config: int.config,
    options: opts ?? {},
    instance: remoteCtx.remote.instance,
    context: {
      webhookBaseUrl: joinPath(ctx.apiUrl, parseWebhookRequest.pathOf(int.id)),
    },
  })
  if (resoUpdate || opts?.import !== false) {
    /** Do not update the `customerId` here... */
    await ctx.asOrgIfNeeded._syncResourceUpdate(int, {
      ...(opts?.import && {
        customerId: reso.customerId ?? undefined,
      }),
      ...resoUpdate,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      settings: {
        // ...(opts?.import && remoteCtx.remote.settings),
        // unconditionally import resource settings
        ...remoteCtx.remote.settings,
        ...resoUpdate?.settings,
      },
      resourceExternalId:
        resoUpdate?.resourceExternalId ?? extractId(reso.id)[2],
    })
    resoUpdate = await ctx.services.getConnectionOrFail(reso.id)
  }
  if (!int.connector.checkResource) {
    return resoUpdate
  }
  return resoUpdate
}

export const connectionRouter = trpc.router({
  // TODO: maybe we should allow connectionId to be part of the path rather than only in the headers

  // Should this really be part of the resource router? or left elsewhere?
  passthrough: remoteProcedure
    .meta({openapi: {method: 'POST', path: '/passthrough', tags: ['Internal']}}) // Where do we put this?
    .input(zPassthroughInput)
    .output(z.any())
    .mutation(async ({input, ctx}) => {
      if (!ctx.remote.connector.passthrough) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: `${ctx.remote.connectorName} does not implement passthrough`,
        })
      }
      return await ctx.remote.connector.passthrough(ctx.remote.instance, input)
    }),

  sourceSync: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/core/connection/{id}/source_sync',
        tags: ['Internal'],
        description:
          'Return records that would have otherwise been emitted during a sync and return it instead',
      },
    })
    .input(
      z.object({
        id: zId('conn'),
        // This is an argument for source_sync to be typed per provider
        state: z.record(z.unknown()).optional(),
        streams: z.record(z.boolean()).optional(),
        // TODO: Introduce `links` array here so we can pass them in too...
      }),
    )
    .output(z.array(z.record(z.any())))
    .mutation(async ({input, ctx}) => {
      const reso = await ctx.services.getConnectionExpandedOrFail(input.id)

      // NOTE: Gotta make sure this is not an infinite sourceSync somehow such as
      // in the case of firestore...

      const res = ctx.services.sourceSync({
        opts: {},
        state: input.state ?? {},
        streams: input.streams ?? {},
        src: reso,
        customer:
          ctx.viewer.role === 'customer' ? {id: ctx.viewer.customerId} : null,
      })

      return rxjs.firstValueFrom(res.pipe(Rx.toArray()))
    }),
  createResource: protectedProcedure
    .meta({openapi: {method: 'POST', path: '/core/connection', tags}})
    .input(
      zRaw.connection.pick({
        connectorConfigId: true,
        settings: true,
        displayName: true,
        customerId: true,
        disabled: true,
        metadata: true,
        integrationId: true,
      }),
    )
    // Questionable why `zConnectContextInput` should be there. Examine whether this is actually
    // needed
    // How do we verify that the userId here is the same as the userId from preConnectOption?
    .output(z.string())
    .mutation(async ({input: {connectorConfigId, settings, ...input}, ctx}) => {
      const int =
        await ctx.asOrgIfNeeded.getConnectorConfigOrFail(connectorConfigId)

      if (int.orgId !== ctx.viewer.orgId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You are not allowed to create resources for ${int.connectorName}`,
        })
      }

      const _extId = makeUlid()
      const connId = makeId('conn', int.connector.name, _extId)

      // Should throw if not working..
      const resoUpdate = {
        triggerDefaultSync: true,
        // TODO: Should no longer depend on external ID
        resourceExternalId: _extId,
        settings,
        ...(await int.connector.checkResource?.({
          config: int.config,
          settings,
          context: {webhookBaseUrl: ''},
          options: {},
        })),
        // TODO: Fix me up
        customerId:
          ctx.viewer.role === 'customer' ? ctx.viewer.customerId : null,
      } satisfies ResourceUpdate
      await ctx.asOrgIfNeeded._syncResourceUpdate(int, resoUpdate)

      // TODO: Do this in one go not two
      if (input.displayName) {
        await ctx.services.patchReturning('connection', connId, input)
      }
      // TODO: return the entire resource object...
      return connId
    }),

  // TODO: Run server-side validation
  updateResource: protectedProcedure
    .meta({openapi: {method: 'PATCH', path: '/core/connection/{id}', tags}})
    .input(
      zRaw.connection.pick({
        id: true,
        settings: true,
        displayName: true,
        metadata: true,
        disabled: true,
        // Not sure if we should allow these two?
        customerId: true,
        integrationId: true,
      }),
    )
    .output(zRaw.connection)
    .mutation(async ({input: {id, ...input}, ctx}) =>
      // TODO: Run mapStandardResource after editing
      // Also we probably do not want deeply nested patch
      // shallow is sufficient more most situations
      ctx.services.patchReturning('connection', id, input),
    ),
  deleteResource: protectedProcedure
    .meta({openapi: {method: 'DELETE', path: '/core/connection/{id}', tags}})
    .input(z.object({id: zId('conn'), skipRevoke: z.boolean().optional()}))
    .output(z.void())
    .mutation(async ({input: {id: connId, ...opts}, ctx}) => {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      const reso = await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)
      const {settings, connectorConfig: ccfg} = reso
      if (!opts?.skipRevoke) {
        await ccfg.connector.revokeResource?.(
          settings,
          ccfg.config,
          ccfg.connector.newInstance?.({
            config: ccfg.config,
            settings,
            fetchLinks: ctx.services.getFetchLinks(reso),
            onSettingsChange: () => {},
          }),
        )
      }
      // if (opts?.todo_deleteAssociatedData) {
      // TODO: Figure out how to delete... Destination is not part of meta service
      // and we don't easily have the ability to handle a delete, it's not part of the sync protocol yet...
      // We should probably introduce a reset / delete event...
      // }
      await ctx.asOrgIfNeeded.metaService.tables.connection.delete(reso.id)
    }),
  listConnectionsRaw: protectedProcedure
    .meta({openapi: {method: 'GET', path: '/core/connection', tags}})
    .input(
      zListParams
        .extend({
          customerId: zCustomerId.nullish(),
          connectorConfigId: zId('ccfg').nullish(),
          connectorName: z.string().nullish(),
          forceRefresh: z.boolean().optional(),
        })
        .optional(),
    )
    .output(z.array(zRaw.connection))
    .query(async ({input = {}, ctx}) => {
      let connections =
        await ctx.services.metaService.tables.connection.list(input)

      // Handle forceRefresh for each resource

      console.log('[listConnectionsRaw] Refreshing tokens for all connections')
      const updatedConnections = await Promise.all(
        connections.map(async (reso) => {
          const expiresAt =
            // @ts-expect-error
            reso?.settings?.['oauth']?.credentials?.raw?.expires_at

          if (
            expiresAt &&
            (input.forceRefresh || new Date(expiresAt).getTime() <= Date.now())
          ) {
            console.log(
              `[listConnectionsRaw] Refreshing token for resource ${reso.connectorName}`,
            )
            const connCheck = await performConnectionCheck(ctx, reso.id, {})
            if (!connCheck) {
              console.warn(
                `[listConnectionsRaw] resourceCheck not implemented for ${reso.connectorName} which requires a refresh. Returning the stale resource.`,
              )
            }
            return connCheck || reso
          }
          return reso
        }),
      )

      connections = updatedConnections

      return connections as Array<ZRaw['connection']>
    }),
  getConnection: protectedProcedure
    .meta({
      description: 'Not automatically called, used for debugging for now',
      openapi: {method: 'GET', path: '/core/connection/{id}', tags},
    })
    .input(
      z.object({
        id: zId('conn'),
        forceRefresh: z.boolean().optional(),
      }),
    )
    .output(
      // TODO: Should we expand this?
      zRaw.connection.extend({
        connector_config: zRaw.connector_config.pick({
          id: true,
          orgId: true,
          connectorName: true,
        }),
      }),
    )
    .query(async ({input, ctx}) => {
      // do not expand for now otherwise permission issues..
      let reso = await ctx.services.getConnectionOrFail(input.id)
      const ccfg = await ctx.services.getConnectorConfigOrFail(
        reso.connectorConfigId,
      )

      // Handle forceRefresh
      // @ts-expect-error
      const expiresAt = reso?.settings?.['oauth']?.credentials?.raw?.expires_at

      if (
        expiresAt &&
        (input.forceRefresh || new Date(expiresAt).getTime() <= Date.now())
      ) {
        console.log('[getConnection] Refreshing token')
        const connCheck = await performConnectionCheck(ctx, reso.id, {})
        if (!connCheck) {
          console.warn(
            `[getConnection] resourceCheck not implemented for ${reso.connectorName} which requires a refresh. Returning the stale resource.`,
          )
        }
        reso = connCheck || reso
      }

      return {
        ...reso,
        connector_config: R.pick(ccfg, ['id', 'orgId', 'connectorName']),
      }
    }),
  checkResource: protectedProcedure
    .meta({
      description: 'Not automatically called, used for debugging for now',
      openapi: {method: 'POST', path: '/core/connection/{id}/_check', tags},
    })
    .input(z.object({id: zId('conn')}).merge(zCheckResourceOptions))
    .output(z.unknown())
    .mutation(async ({input: {id: connId, ...opts}, ctx}) => {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      const resourceCheck = await performConnectionCheck(ctx, connId, opts)
      if (!resourceCheck) {
        return `Resource check not implemented for ${connId}`
      }
      return resourceCheck
    }),

  // MARK: - Sync

  syncResource: protectedProcedure
    .meta({
      openapi: {method: 'POST', path: '/core/connection/{id}/_sync', tags},
    })
    .input(z.object({id: zId('conn')}).merge(zSyncOptions))
    .output(z.void())
    .mutation(async function syncResource({input: {id: connId, ...opts}, ctx}) {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      if (opts?.async) {
        await inngest.send({
          name: 'sync/resource-requested',
          data: {connectionId: connId},
        })
        return
      }
      const reso = await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)
      // No need to checkResource here as sourceSync should take care of it

      if (opts?.metaOnly) {
        await sync({
          source:
            reso.connectorConfig.connector.sourceSync?.({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              instance: reso.connectorConfig.connector.newInstance?.({
                config: reso.connectorConfig.config,
                settings: reso.settings,
                fetchLinks: ctx.services.getFetchLinks(reso),
                onSettingsChange: () => {},
              }),
              config: reso.connectorConfig.config,
              settings: reso.settings,
              customer: reso.customerId && {id: reso.customerId},
              state: {},
              streams: {},
            }) ?? rxjs.EMPTY,
          destination: ctx.asOrgIfNeeded.metaLinks.postSource({
            src: reso,
          }),
        })
        return
      }

      // TODO: Figure how to handle situations where resource does not exist yet
      // but pipeline is already being persisted properly. This current solution
      // is vulnerable to race condition and feels brittle. Though syncResource is only
      // called from the UI so we are fine for now.
      await ctx.asOrgIfNeeded._syncResourceUpdate(reso.connectorConfig, {
        customerId: reso.customerId,
        settings: reso.settings,
        resourceExternalId: extractId(reso.id)[2],
        integration: reso.integration && {
          externalId: extractId(reso.integration.id)[2],
          data: reso.integration.external ?? {},
        },
        triggerDefaultSync: true,
      })
    }),
})
