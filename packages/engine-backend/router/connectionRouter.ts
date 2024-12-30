import type {ConnectionUpdate, ZRaw} from '@openint/cdk'
import {
  extractId,
  getRemoteContext,
  makeId,
  sync,
  zCheckConnectionOptions,
  zCustomerId,
  zId,
  zPassthroughInput,
  zRaw,
} from '@openint/cdk'
import {TRPCError} from '@openint/trpc'
import {joinPath, makeUlid, R, Rx, rxjs, z} from '@openint/util'
import {inngest} from '../inngest'
import {parseWebhookRequest} from '../parseWebhookRequest'
import {zSyncOptions} from '../types'
import {protectedProcedure, remoteProcedure, trpc} from './_base'
import {zListParams} from './_schemas'

export {type inferProcedureInput} from '@openint/trpc'

const tags = ['Core']

const zExpandIntegration = z.object({
  id: zId('int'),
  name: z.string(),
  logoUrl: z.string().url(),
})

const zExpandConnector = z.object({
  id: zId('ccfg'),
  name: z.string(),
  logoUrl: z.string().url(),
})

export async function performConnectionCheck(
  ctx: any,
  connId: string,
  opts: any,
) {
  const remoteCtx = await getRemoteContext({
    ...ctx,
    remoteConnectionId: connId,
  })
  const {connectorConfig: int, ...conn} =
    await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)

  let connUpdate = await int.connector.checkConnection?.({
    settings: remoteCtx.remote.settings,
    config: int.config,
    options: opts ?? {},
    instance: remoteCtx.remote.instance,
    context: {
      webhookBaseUrl: joinPath(ctx.apiUrl, parseWebhookRequest.pathOf(int.id)),
    },
  })
  if (
    conn?.settings?.error ||
    connUpdate ||
    opts?.import !== false ||
    remoteCtx.remote.settings?.oauth?.error
  ) {
    /** Do not update the `customerId` here... */
    await ctx.asOrgIfNeeded._syncConnectionUpdate(int, {
      customerId: conn.customerId ?? undefined,
      integration: conn.integrationId
        ? {
            externalId: extractId(conn.integrationId)[2],
            data: conn.integration?.external ?? {},
          }
        : undefined,
      ...connUpdate,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      settings: {
        // ...(opts?.import && remoteCtx.remote.settings),
        // unconditionally import connection settings
        ...remoteCtx.remote.settings,
        ...connUpdate?.settings,
      },
      connectionExternalId:
        connUpdate?.connectionExternalId ?? extractId(conn.id)[2],
    })
    connUpdate = await ctx.services.getConnectionOrFail(conn.id)
  }
  if (opts?.expand?.includes('integration')) {
    const possibleIntegrations = await int.connector?.listIntegrations?.({
      ccfg: int,
    })
    const integration = possibleIntegrations?.items?.find(
      (i: any) => i.id === extractId(connUpdate?.integrationId)[2],
    )
    connUpdate.integration = connUpdate?.integrationId
      ? {
          id: connUpdate?.integrationId,
          name:
            integration?.name?.toLowerCase() ||
            int.connector.name?.toLowerCase(),
          logoUrl:
            (integration?.logo_url &&
              (process.env['NEXT_PUBLIC_SERVER_URL'] ||
                'https://app.openint.dev') + integration?.logo_url) ||
            (int.connector.metadata.logoUrl &&
              (process.env['NEXT_PUBLIC_SERVER_URL'] ||
                'https://app.openint.dev') + int.connector.metadata.logoUrl),
        }
      : undefined
  }
  if (opts?.expand?.includes('integration.connector')) {
    connUpdate.connector = {
      id: int.id,
      name: int.connector.name?.toLowerCase(),
      logoUrl:
        int.connector.metadata.logoUrl &&
        (process.env['NEXT_PUBLIC_SERVER_URL'] || 'https://app.openint.dev') +
          int.connector.metadata.logoUrl,
    }
  }
  if (!int.connector.checkConnection) {
    return connUpdate
  }
  return connUpdate
}

export const connectionRouter = trpc.router({
  // TODO: maybe we should allow connectionId to be part of the path rather than only in the headers

  // Should this really be part of the connection router? or left elsewhere?
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
      const conn = await ctx.services.getConnectionExpandedOrFail(input.id)

      // NOTE: Gotta make sure this is not an infinite sourceSync somehow such as
      // in the case of firestore...

      const res = ctx.services.sourceSync({
        opts: {},
        state: input.state ?? {},
        streams: input.streams ?? {},
        src: conn,
        customer:
          ctx.viewer.role === 'customer' ? {id: ctx.viewer.customerId} : null,
      })

      return rxjs.firstValueFrom(res.pipe(Rx.toArray()))
    }),
  createConnection: protectedProcedure
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
          message: `You are not allowed to create connections for ${int.connectorName}`,
        })
      }

      const _extId = makeUlid()
      const connId = makeId('conn', int.connector.name, _extId)

      // Should throw if not working..
      const connUpdate = {
        triggerDefaultSync: true,
        // TODO: Should no longer depend on external ID
        connectionExternalId: _extId,
        settings,
        ...(await int.connector.checkConnection?.({
          config: int.config,
          settings,
          context: {webhookBaseUrl: ''},
          options: {},
        })),
        // TODO: Fix me up
        customerId:
          ctx.viewer.role === 'customer' ? ctx.viewer.customerId : null,
      } satisfies ConnectionUpdate
      await ctx.asOrgIfNeeded._syncConnectionUpdate(int, connUpdate)

      // TODO: Do this in one go not two
      if (input.displayName) {
        await ctx.services.patchReturning('connection', connId, input)
      }
      // TODO: return the entire connection object...
      return connId
    }),

  // TODO: Run server-side validation
  updateConnection: protectedProcedure
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
      // TODO: Run mapStandardConnection after editing
      // Also we probably do not want deeply nested patch
      // shallow is sufficient more most situations
      ctx.services.patchReturning('connection', id, input),
    ),
  deleteConnection: protectedProcedure
    .meta({openapi: {method: 'DELETE', path: '/core/connection/{id}', tags}})
    .input(z.object({id: zId('conn'), skipRevoke: z.boolean().optional()}))
    .output(z.void())
    .mutation(async ({input: {id: connId, ...opts}, ctx}) => {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      const conn = await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)
      const {settings, connectorConfig: ccfg} = conn
      if (!opts?.skipRevoke) {
        await ccfg.connector.revokeConnection?.(
          settings,
          ccfg.config,
          ccfg.connector.newInstance?.({
            config: ccfg.config,
            settings,
            fetchLinks: ctx.services.getFetchLinks(conn),
            onSettingsChange: () => {},
          }),
        )
      }
      // if (opts?.todo_deleteAssociatedData) {
      // TODO: Figure out how to delete... Destination is not part of meta service
      // and we don't easily have the ability to handle a delete, it's not part of the sync protocol yet...
      // We should probably introduce a reset / delete event...
      // }
      await ctx.asOrgIfNeeded.metaService.tables.connection.delete(conn.id)
    }),
  listConnection: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/core/connection',
        tags,
        summary: 'List connections',
      },
    })
    .input(
      zListParams
        .extend({
          customerId: zCustomerId.nullish(),
          connectorConfigId: zId('ccfg').nullish(),
          connectorName: z.string().nullish(),
          forceRefresh: z.boolean().optional(),
          expand: z.string().optional().openapi({
            description:
              'Comma-separated list of expand options: integration and/or integration.connector',
          }),
        })
        .optional(),
    )
    .output(
      z.array(
        zRaw.connection.extend({
          integration: zExpandIntegration.nullish(),
          connector: zExpandConnector.nullish(),
        }),
      ),
    )
    .query(async ({input = {}, ctx}) => {
      const expandArray =
        input.expand?.split(',').map((item) => item.trim()) || []
      const validExpandOptions = ['integration', 'integration.connector']

      if (!expandArray.every((item) => validExpandOptions.includes(item))) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid expand options',
        })
      }

      let connections =
        await ctx.services.metaService.tables.connection.list(input)

      // Handle forceRefresh for each connection

      console.log('[listConnection] Refreshing tokens for all connections ')
      const updatedConnections = await Promise.all(
        connections.map(async (conn) => {
          const expiresAt =
            // @ts-expect-error
            conn?.settings?.['oauth']?.credentials?.raw?.expires_at

          if (
            (expiresAt &&
              (input.forceRefresh ||
                new Date(expiresAt).getTime() <= Date.now())) ||
            input.expand
          ) {
            console.log(
              `[listConnection] Refreshing token for connection ${conn.connectorName}`,
            )
            const connCheck = await performConnectionCheck(ctx, conn.id, {
              expand: expandArray,
            })
            if (!connCheck) {
              console.warn(
                `[listConnection] connectionCheck not implemented for ${conn.connectorName} which requires a refresh. Returning the stale connection.`,
              )
            }
            return connCheck || conn
          }
          return conn
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
        expand: z.string().optional().openapi({
          description:
            'Comma-separated list of expand options: integration and/or integration.connector',
        }),
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
        integration: zExpandIntegration.nullish(),
        connector: zExpandConnector.nullish(),
      }),
    )
    .query(async ({input, ctx}) => {
      const expandArray =
        input.expand?.split(',').map((item) => item.trim()) || []
      const validExpandOptions = ['integration', 'integration.connector']

      if (!expandArray.every((item) => validExpandOptions.includes(item))) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid expand options',
        })
      }

      // do not expand for now otherwise permission issues..
      let conn = await ctx.services.getConnectionOrFail(input.id)
      const ccfg = await ctx.services.getConnectorConfigOrFail(
        conn.connectorConfigId,
      )

      // Handle forceRefresh
      // @ts-expect-error
      const expiresAt = conn?.settings?.['oauth']?.credentials?.raw?.expires_at

      if (
        (expiresAt &&
          (input.forceRefresh ||
            new Date(expiresAt).getTime() <= Date.now())) ||
        input.expand
      ) {
        console.log('[getConnection] Refreshing token')
        const connCheck = await performConnectionCheck(ctx, conn.id, {
          expand: expandArray,
        })
        if (!connCheck) {
          console.warn(
            `[getConnection] connectionCheck not implemented for ${conn.connectorName} which requires a refresh. Returning the stale connection.`,
          )
        }
        conn = connCheck || conn
      }

      return {
        ...conn,
        connector_config: R.pick(ccfg, ['id', 'orgId', 'connectorName']),
      }
    }),
  checkConnection: protectedProcedure
    .meta({
      description: 'Not automatically called, used for debugging for now',
      openapi: {method: 'POST', path: '/core/connection/{id}/_check', tags},
    })
    .input(z.object({id: zId('conn')}).merge(zCheckConnectionOptions))
    .output(z.unknown())
    .mutation(async ({input: {id: connId, ...opts}, ctx}) => {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      const connectionCheck = await performConnectionCheck(ctx, connId, opts)
      if (!connectionCheck) {
        return `Connection check not implemented for ${connId}`
      }
      return connectionCheck
    }),

  // MARK: - Sync

  syncConnection: protectedProcedure
    .meta({
      openapi: {method: 'POST', path: '/core/connection/{id}/_sync', tags},
    })
    .input(z.object({id: zId('conn')}).merge(zSyncOptions))
    .output(z.void())
    .mutation(async ({input: {id: connId, ...opts}, ctx}) => {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      if (opts?.async) {
        await inngest.send({
          name: 'sync/connection-requested',
          data: {connectionId: connId},
        })
        return
      }
      const conn = await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)
      // No need to checkConnection here as sourceSync should take care of it

      if (opts?.metaOnly) {
        await sync({
          source:
            conn.connectorConfig.connector.sourceSync?.({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              instance: conn.connectorConfig.connector.newInstance?.({
                config: conn.connectorConfig.config,
                settings: conn.settings,
                fetchLinks: ctx.services.getFetchLinks(conn),
                onSettingsChange: () => {},
              }),
              config: conn.connectorConfig.config,
              settings: conn.settings,
              customer: conn.customerId && {id: conn.customerId},
              state: {},
              streams: {},
            }) ?? rxjs.EMPTY,
          destination: ctx.asOrgIfNeeded.metaLinks.postSource({
            src: conn,
          }),
        })
        return
      }

      // TODO: Figure how to handle situations where connection does not exist yet
      // but pipeline is already being persisted properly. This current solution
      // is vulnerable to race condition and feels brittle. Though syncConnection is only
      // called from the UI so we are fine for now.
      await ctx.asOrgIfNeeded._syncConnectionUpdate(conn.connectorConfig, {
        customerId: conn.customerId,
        settings: conn.settings,
        connectionExternalId: extractId(conn.id)[2],
        integration: conn.integration && {
          externalId: extractId(conn.integration.id)[2],
          data: conn.integration.external ?? {},
        },
        triggerDefaultSync: true,
      })
    }),
})
