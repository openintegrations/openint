import {logLink} from '@opensdks/fetch-links'
import {initNangoSDK} from '@opensdks/sdk-nango'
import {compact} from 'remeda'
import type {ProtectedContext} from '@openint/trpc'
import {protectedProcedure, TRPCError} from '@openint/trpc'
import {
  nangoConnectionWithCredentials,
  toNangoConnectionId,
  toNangoProviderConfigKey,
} from './nangoProxyLink'

export async function getRemoteContext(ctx: ProtectedContext) {
  // TODO Should parse headers in here?
  if (!ctx.remoteConnectionId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'remoteConnectionId missing. Check your x-connection-* headers',
    })
  }

  // Ensure that customer can access its own connections
  if (ctx.viewer.role === 'customer') {
    await ctx.services.getConnectionOrFail(ctx.remoteConnectionId)
  }

  // Elevant role to organization here
  const connection = await ctx.asOrgIfNeeded.getConnectionExpandedOrFail(
    ctx.remoteConnectionId,
  )

  let connectionId = toNangoConnectionId(connection.id) // ctx.customerId

  // Note: Monkey patch for old connections
  if (connection.createdAt < new Date('2024-12-10')) {
    connectionId = connectionId.replace('conn_', 'reso_')
  }

  const providerConfigKey = toNangoProviderConfigKey(
    connection.connectorConfigId, // ctx.providerName
  )
  const nango = initNangoSDK({
    headers: {authorization: `Bearer ${ctx.env.NANGO_SECRET_KEY}`},
  })

  const oauthCredentialsExpiryTime = new Date(
    // @ts-expect-error oauth is conditionally present
    connection.settings?.oauth?.credentials?.raw?.expires_at ??
      new Date(new Date().getTime() + 1000),
  )
  const forceRefreshCredentials = oauthCredentialsExpiryTime < new Date()

  const settings = {
    ...connection.settings,
    ...(connection.connectorConfig.connector.metadata?.nangoProvider && {
      oauth: await nango
        .GET('/connection/{connectionId}', {
          params: {
            path: {connectionId},
            query: {
              refresh_token: true,
              provider_config_key: providerConfigKey,
              force_refresh: forceRefreshCredentials, // Conditionally call based on expiry
            },
          },
        })
        .then((r: any) => {
          return nangoConnectionWithCredentials.parse(r.data)
        })
        .catch((error) => {
          console.error('nangoConnectionWithCredentials error', error)
          throw error
        }),
    }),
  }

  const instance: unknown = connection.connectorConfig.connector.newInstance?.({
    config: connection.connectorConfig.config,
    settings,
    fetchLinks: compact([
      logLink(),
      // No more, has issues.
      // connection.connectorConfig.connector.metadata?.nangoProvider &&
      //   ctx.env.NANGO_SECRET_KEY &&
      //   nangoProxyLink({
      //     secretKey: ctx.env.NANGO_SECRET_KEY,
      //     connectionId,
      //     providerConfigKey,
      //   }),
    ]),

    onSettingsChange: (settings) =>
      ctx.services.metaLinks.patch('connection', connection.id, {settings}),
  })

  return {
    ...ctx,
    // TODO: Consider renaming to just connection rather than `remote`
    remote: {
      /** Aka remoteClient */
      instance,
      id: connection.id,
      // TODO: Rename customerId to just customerId
      customerId: connection.customerId ?? '',
      connectorConfigId: connection.connectorConfig.id,
      connector: connection.connectorConfig.connector,
      connectorName: connection.connectorName,
      connectorMetadata: connection.connectorConfig.connector.metadata,
      settings, // Not connection.settings which is out of date. // TODO: we should update connection.settings through
      // TODO: Need to be careful this is never returned to any customer endpoints
      // and only used for making requests with remotes
      config: connection.connectorConfig.config,
    },
  }
}

export const remoteProcedure = protectedProcedure.use(async ({next, ctx}) =>
  next({ctx: await getRemoteContext(ctx)}),
)

export type RemoteProcedureContext = ReturnType<
  (typeof remoteProcedure)['query']
>['_def']['_ctx_out']
