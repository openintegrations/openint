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
  logo_url: z
    .string() /*.url()*/
    .url(),
})

const zExpandConnector = z.object({
  id: zId('ccfg'),
  name: z.string(),
  logo_url: z
    .string() /*.url()*/
    .url(),
})

/* eslint-disable */
export async function performConnectionCheck(
  ctx: any,
  connId: string,
  opts: any,
) {
  console.log('will performConnectionCheck', connId, opts)
  const remoteCtx = await getRemoteContext({
    ...ctx,
    remoteConnectionId: connId,
  })
  const {connector_config: ccfg, ...conn} =
    await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)

  // console.log('got connection', connId, conn, ccfg)
  let connUpdate = await ccfg.connector.checkConnection?.({
    settings: remoteCtx.remote.settings,
    config: ccfg.config,
    options: opts ?? {},
    instance: remoteCtx.remote.instance,
    context: {
      webhookBaseUrl: joinPath(ctx.apiUrl, parseWebhookRequest.pathOf(ccfg.id)),
    },
  })
  // console.log('connUpdate', connUpdate)
  if (
    conn?.settings?.error ||
    connUpdate ||
    opts?.import !== false ||
    remoteCtx.remote.settings?.oauth?.error
  ) {
    /** Do not update the `customerId` here... */
    await ctx.asOrgIfNeeded._syncConnectionUpdate(ccfg, {
      customerId: conn.customerId ?? undefined,
      integration: conn.integrationId
        ? {
            externalId: extractId(conn.integrationId)[2],
            data: conn.integration?.external ?? {},
          }
        : undefined,
      ...connUpdate,
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
  // console.log('connUpdate 2', connUpdate)
  if (opts?.expand?.includes('integration')) {
    const possibleIntegrations = await ccfg.connector?.listIntegrations?.({
      ccfg: ccfg,
    })
    const integration = possibleIntegrations?.items?.find(
      (i: any) => i.id === extractId(connUpdate?.integrationId)[2],
    )
    connUpdate.integration = connUpdate?.integrationId
      ? {
          id: connUpdate?.integrationId,
          name:
            integration?.name?.toLowerCase() ||
            ccfg.connector.name?.toLowerCase(),
          logo_url:
            (integration?.logo_url &&
              (process.env['NEXT_PUBLIC_SERVER_URL'] ||
                'https://app.openint.dev') + integration?.logo_url) ||
            (ccfg.connector.metadata.logoUrl &&
              (process.env['NEXT_PUBLIC_SERVER_URL'] ||
                'https://app.openint.dev') + ccfg.connector.metadata.logoUrl),
        }
      : undefined
  }
  // console.log('connUpdate3', connUpdate)
  if (opts?.expand?.includes('integration.connector')) {
    connUpdate.connector = {
      id: ccfg.id,
      name: ccfg.connector.name?.toLowerCase(),
      logo_url:
        ccfg.connector.metadata.logoUrl &&
        (process.env['NEXT_PUBLIC_SERVER_URL'] || 'https://app.openint.dev') +
          ccfg.connector.metadata.logoUrl,
    }
  }
  // console.log('connUpdate 4', connUpdate)
  if (!ccfg.connector.checkConnection) {
    return connUpdate
  }
  return connUpdate
}
/* eslint-enable */

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
    // Remove from oai spec for now
    // .meta({
    //   openapi: {
    //     method: 'POST',
    //     path: '/core/connection/{id}/source_sync',
    //     tags: ['Internal'],
    //     description:
    //       'Return records that would have otherwise been emitted during a sync and return it instead',
    //   },
    // })
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
          ctx.viewer.role === 'customer' ? {id: ctx.viewer.customer_id} : null,
      })

      return rxjs.firstValueFrom(res.pipe(Rx.toArray()))
    }),
  createConnection: protectedProcedure
    .meta({openapi: {method: 'POST', path: '/core/connection', tags}})
    .input(
      zRaw.connection.pick({
        connector_config_id: true,
        settings: true,
        display_name: true,
        customer_id: true,
        disabled: true,
        metadata: true,
        integration_id: true,
      }),
    )
    // Questionable why `zConnectContextInput` should be there. Examine whether this is actually
    // needed
    // How do we verify that the userId here is the same as the userId from preConnectOption?
    .output(z.string()) // TODO(api): We should not return just a string here. Should return an object
    .mutation(
      async ({input: {connector_config_id, settings, ...input}, ctx}) => {
        const int =
          await ctx.asOrgIfNeeded.getConnectorConfigOrFail(connector_config_id)

        if (int.org_id !== ctx.viewer.org_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `You are not allowed to create connections for ${int.connector_name}`,
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
          customer_id:
            ctx.viewer.role === 'customer' ? ctx.viewer.customer_id : null,
        } satisfies ConnectionUpdate
        await ctx.asOrgIfNeeded._syncConnectionUpdate(int, connUpdate)

        // TODO: Do this in one go not two
        if (input.display_name) {
          await ctx.services.patchReturning('connection', connId, input)
        }
        // TODO: return the entire connection object...
        return connId
      },
    ),

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
        integration_id: true,
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
    .output(z.object({}))
    .mutation(async ({input: {id: connId, ...opts}, ctx}) => {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      const conn = await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)
      const {settings, connector_config: ccfg} = conn
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
      return {}
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
          customer_id: zCustomerId.nullish(),
          connector_config_id: zId('ccfg').nullish(),
          connector_name: z.string().nullish(),
          force_refresh: z.boolean().optional(),
          refresh: z.enum(['none', 'expired', 'all']).default('expired'),
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

      // console.log('[listConnection] Listing connections')

      let connections =
        await ctx.services.metaService.tables.connection.list(input)

      // Handle forceRefresh for each connection

      console.log('[listConnection] Maybe refresh token')
      const updatedConnections = await Promise.all(
        connections.map(async (conn) => {
          const expiresAt =
            // @ts-expect-error
            conn?.settings?.['oauth']?.credentials?.raw?.expires_at

          if (
            (expiresAt &&
              (input.force_refresh ||
                new Date(expiresAt).getTime() <= Date.now())) ||
            input.expand
          ) {
            console.log(
              `[listConnection] Refreshing token for connection ${conn.id}`,
            )
            const connCheck = await performConnectionCheck(ctx, conn.id, {
              expand: expandArray,
            })
            // console.log('connCheck', conn.id, connCheck)
            if (!connCheck) {
              console.warn(
                `[listConnection] connectionCheck not implemented for ${conn.connector_name} which requires a refresh. Returning the stale connection.`,
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
      const ccfg = await ctx.asOrgIfNeeded.getConnectorConfigOrFail(
        conn.connector_config_id,
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
            `[getConnection] connectionCheck not implemented for ${conn.connector_name} which requires a refresh. Returning the stale connection.`,
          )
        }
        conn = connCheck || conn
      }

      return {
        ...conn,
        // NOTE: careful to not return the entire object as it has secrets
        // and this method is open to end user auth
        connector_config: R.pick(ccfg, ['id', 'org_id', 'connector_name']),
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
    .output(
      z.object({
        connection_requested_event_id: z.string().optional(),
        pipeline_syncs: z
          .array(
            z.object({
              pipeline_id: z.string(),
              sync_completed_event_id: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({input: {id: connId, ...opts}, ctx}) => {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getConnectionOrFail(connId)
      }
      if (opts?.async) {
        const {ids} = await inngest.send({
          name: 'sync/connection-requested',
          data: {connectionId: connId},
        })
        return {connection_requested_event_id: ids[0]}
      }
      const conn = await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(connId)
      // No need to checkConnection here as sourceSync should take care of it

      if (opts?.meta_only) {
        await sync({
          source:
            conn.connector_config.connector.sourceSync?.({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              instance: conn.connector_config.connector.newInstance?.({
                config: conn.connector_config.config,
                settings: conn.settings,
                fetchLinks: ctx.services.getFetchLinks(conn),
                onSettingsChange: () => {},
              }),
              config: conn.connector_config.config,
              settings: conn.settings,
              customer: conn.customer_id && {id: conn.customer_id},
              state: {},
              streams: {},
            }) ?? rxjs.EMPTY,
          destination: ctx.asOrgIfNeeded.metaLinks.postSource({
            src: conn,
          }),
        })
        return {pipeline_syncs: []}
      }

      // TODO: Figure how to handle situations where connection does not exist yet
      // but pipeline is already being persisted properly. This current solution
      // is vulnerable to race condition and feels brittle. Though syncConnection is only
      // called from the UI so we are fine for now.
      const connSync = await ctx.asOrgIfNeeded._syncConnectionUpdate(
        conn.connector_config,
        {
          customer_id: conn.customer_id,
          settings: conn.settings,
          connectionExternalId: extractId(conn.id)[2],
          integration: conn.integration && {
            externalId: extractId(conn.integration.id)[2],
            data: conn.integration.external ?? {},
          },
          triggerDefaultSync: true,
        },
      )
      return connSync
    }),
})
