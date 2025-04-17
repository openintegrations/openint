import type {Z} from '@openint/util/zod-utils'
import type {Core} from '../../models'
import type {ConnectorName} from './connector.models'

import {TRPCError} from '@trpc/server'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {z} from '@openint/util/zod-utils'
import {core} from '../../models'
import {getConnectorModelByName} from './connector.models'

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

export const zConnectionExpandOption = z
  .enum(['connector'])
  .describe('Fields to expand: connector (includes connector details)')

export const zConnectionExpanded = z
  .intersection(
    core.connection_select,
    z.object({
      connector: core.connector.optional(),
      // TODO(@openint-box): ensure this exists
      status: zConnectionStatus.optional(),
      integration: core.integration_select.optional(),
    }),
  )
  .describe('The connection details')

// TODO: Add these into connection expanded
// interface ConnectionRelations {
//   connector_config: Core['connector_config_select']
//   customer: Core['customer_select']
//   connector: Core['connector']
//   integration: Core['integration_select']
// }
export type ConnectionExpanded = Z.infer<typeof zConnectionExpanded>

const defaultValueLookup: Record<string, unknown> = {
  oauth: {},
}
const insertValueToObject = (
  obj: Record<string, unknown> | undefined,
  path: Array<string | number>,
  value: string,
) => {
  let current = obj ?? {}
  path.forEach((key, index) => {
    if (index === path.length - 1) {
      current[key] = value
    } else {
      if (!current[key]) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }
  })
}

/**
 * Formats a connection for API responses
 */
export async function formatConnection(
  _ctx: any,
  connection: Core['connection_select'],
  include_secrets: Z.infer<typeof zIncludeSecrets> = 'none',
  expand: Array<Z.infer<typeof zConnectionExpandOption>> = [],
) {
  const connector =
    defConnectors[connection.connector_name as keyof typeof defConnectors]
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found for connection ${connection['id']}`,
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
  const fullConnection = {...connection}
  try {
    zConnectionExpanded.parse(connection)
  } catch (err) {
    const extras = connection.settings.extra?.tokenInfo ?? {}
    const scopeSeparator =
      'jsonDef' in connector.metadata
        ? connector.metadata.jsonDef.auth.scope_separator
        : ''
    const credentials = connection.settings.oauth?.credentials ?? {}

    if (err instanceof z.ZodError) {
      const errorPaths = err.issues.map((issue) => issue.path)
      errorPaths.forEach((path) => {
        const key = path[path.length - 1] as string
        const extrasValue =
          key === 'scope' ? extras.scopes?.join(scopeSeparator) : extras[key]
        const valueToInsert =
          extrasValue ||
          credentials?.[key] ||
          credentials?.raw?.[key] ||
          defaultValueLookup[key] ||
          ''
        insertValueToObject(fullConnection, path, valueToInsert)
      })
    }
  }

  let expandedFields = {}
  if (expand.includes('connector')) {
    expandedFields = {
      connector: getConnectorModelByName(
        connection.connector_name as ConnectorName,
      ),
    }
  }

  return {
    ...fullConnection,
    // ...settingsToInclude, // buggy, fix me
    ...expandedFields,
  }
}
