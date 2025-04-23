import type {ConnectorServer, ExtCustomerId} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'

import {TRPCError} from '@trpc/server'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {eq, schema} from '@openint/db'
import {getBaseURLs} from '@openint/env'
import {getApiV1URL} from '../../../lib/typed-routes'
import {connection_select_base, core} from '../../../models'
import {RouterContext} from '../../context'

const checkConnectionResultSchema = connection_select_base.pick({
  id: true,
  status: true,
  status_message: true,
})

export function connectionExpired(
  connection: Z.infer<typeof core.connection_select>,
) {
  const expiresAt = connection.settings?.oauth?.credentials?.expires_at
  if (!expiresAt) {
    return false
  }
  return new Date(expiresAt) < new Date()
}

export function connectionCanBeChecked(
  connection: Z.infer<typeof core.connection_select>,
) {
  const connector = serverConnectors[
    connection.connector_name as keyof typeof serverConnectors
  ] as ConnectorServer
  if (!connector) {
    return false
  }
  return !!connector.checkConnection
}

export async function checkConnection(
  connection: Z.infer<typeof core.connection_select>,
  ctx: RouterContext,
  _connector?: ConnectorServer, // for tests
  skipUpdate?: boolean,
): Promise<Z.infer<typeof checkConnectionResultSchema>> {
  const connector =
    _connector ??
    (serverConnectors[
      connection.connector_name as keyof typeof serverConnectors
    ] as ConnectorServer)
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found for connection ${connection.id}`,
    })
  }
  if (!connection.connector_config_id) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector config not found for connection ${connection.id}`,
    })
  }
  const ccfg = await ctx.asOrgIfCustomer.db.query.connector_config.findFirst({
    where: eq(schema.connector_config.id, connection.connector_config_id),
  })
  if (!ccfg) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector config ${connection.connector_config_id} not found`,
    })
  }
  if (connector.checkConnection) {
    const context = {
      webhookBaseUrl: getApiV1URL(`/webhook/${ccfg.connector_name}`),
      extCustomerId: (ctx.viewer.role === 'customer'
        ? ctx.viewer.customerId
        : (ctx.viewer.userId ?? '')) as ExtCustomerId,
      fetch: ctx.fetch,
      baseURLs: getBaseURLs(null),
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const instance = connector.newInstance?.({
      config: ccfg.config,
      settings: undefined,
      context,
      fetchLinks: [],
      onSettingsChange: () => {}, // noop
    })

    try {
      const res = await connector.checkConnection({
        settings: connection.settings,
        config: ccfg.config,
        options: {},
        instance,
        context,
      })
      // console.log('[connection] Check connection result', res)
      // QQ: should this parse the results of checkConnection somehow?

      // Can this happen after returning result? But what about read-after-write consistency?
      if (!skipUpdate) {
        await ctx.asOrgIfCustomer.db
          .update(schema.connection)
          .set({
            updated_at: new Date().toISOString(),
            status: res.status,
            status_message: res.status_message,
            ...(res.settings && {settings: res.settings}),
          })
          .where(eq(schema.connection.id, connection.id))
      }

      // TODO: persist the result of checkConnection for settings
      return {
        ...res,
        id: connection.id,
        status: res.status ?? null,
        status_message: res.status_message ?? null,
      }
    } catch (error) {
      console.error('[connection] Check connection failed', error)
      if (!skipUpdate) {
        await ctx.asOrgIfCustomer.db
          .update(schema.connection)
          .set({
            status: 'error',
            status_message: 'Unable to check connection',
            updated_at: new Date().toISOString(),
          })
          .where(eq(schema.connection.id, connection.id))
      }
      return {
        id: connection.id,
        status: 'error',
        status_message: 'Unable to check connection. Unknown error.',
      }
    }
  } else {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: `Connector ${connection.connector_name} does not support check_connection`,
    })
  }
}
