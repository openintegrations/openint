import {TRPCError} from '@trpc/server'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {z, type Z} from '@openint/util/zod-utils'
import {Core, core} from '../models'
import {getConnectorModelByName, type ConnectorName} from './connector.models'

export const zIncludeSecrets = z
  .enum(['none', 'basic', 'all'])
  .describe(
    'Controls secret inclusion: none (default), basic (auth only), or all secrets',
  )

export const zRefreshPolicy = z
  .enum(['none', 'force', 'auto'])
  .describe(
    'Controls credential refresh: none (never), force (always), or auto (when expired, default)',
  )

export const zConnectionStatus = z
  .enum(['healthy', 'disconnected', 'error', 'manual'])
  .describe(
    'Connection status: healthy (all well), disconnected (needs reconnection), error (system issue), manual (import connection)',
  )

export const zConnectionError = z
  .enum(['refresh_failed', 'unknown_external_error'])
  .describe('Error types: refresh_failed and unknown_external_error')

export const zConnectonExpandOption = z
  .enum(['connector'])
  .describe('Fields to expand: connector (includes connector details)')

export const zConnectionExpanded = z
  .intersection(
    core.connection_select,
    z.object({
      connector: core.connector.optional(),
    }),
  )
  .describe('The connection details')

/**
 * Strips sensitive OAuth credentials from a credentials object
 */
export function stripSensitiveOauthCredentials(credentials: any) {
  return {
    ...credentials,
    refresh_token: undefined,
    raw: undefined,
  }
}

/**
 * Formats a connection for API responses
 */
export async function formatConnection(
  _ctx: any,
  connection: Core['connection_select'],
  include_secrets: Z.infer<typeof zIncludeSecrets> = 'none',
  expand: Z.infer<typeof zConnectonExpandOption>[] = [],
) {
  const connector =
    defConnectors[connection.connector_name as keyof typeof defConnectors]
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found for connection ${connection.id}`,
    })
  }

  console.log('include_secrets', include_secrets)

  // Handle different levels of secret inclusion
  // the default is 'none' at which point settings should be an empty object
  // let settingsToInclude = {settings: {}}
  // if (include_secrets === 'basic' && connection.settings.oauth) {
  //   settingsToInclude = {
  //     settings: {
  //       ...connection.settings,
  //       // NOTE: in future we should add other settings sensitive value
  //       // stripping for things like api key here and abstract it
  //       oauth: connection.settings?.oauth?.credentials
  //         ? {
  //             ...connection.settings.oauth,
  //             credentials: stripSensitiveOauthCredentials(
  //               connection.settings.oauth.credentials,
  //             ),
  //           }
  //         : undefined,
  //     },
  //   }
  // } else if (include_secrets === 'all') {
  //   settingsToInclude = {settings: connection.settings}
  // }

  let expandedFields = {}
  if (expand.includes('connector')) {
    expandedFields = {
      connector: getConnectorModelByName(
        connection.connector_name as ConnectorName,
      ),
    }
  }

  return {
    ...connection,
    // ...settingsToInclude, // buggy, fix me
    ...expandedFields,
  }
}
