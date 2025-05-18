import type {Z} from '@openint/util/zod-utils'
import type {Core} from '../../models'
import type {ConnectorName} from './connector.models'

import {TRPCError} from '@trpc/server'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {z, zCoerceArray} from '@openint/util/zod-utils'
import {core} from '../../models'
import {getConnectorModelByName} from './connector.models'

export const zIncludeSecrets = z
  // .enum(['none', 'basic', 'all']) // Make me an enum later...
  .boolean()
// .describe(
//   'Controls secret inclusion: none (default), basic (auth only), or all secrets',
// )

export const zRefreshPolicy = z
  .enum(['none', 'force', 'auto'])
  .describe(
    'Controls credential refresh: none (never), force (always), or auto (when expired, default)',
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
      integration: core.integration_select.optional(),
      // TODO: Add these into connection expanded
      // interface ConnectionRelations {
      //   connector_config: Core['connector_config_select']
      //   customer: Core['customer_select']
      // }
    }),
  )
  .describe('The connection details')

export type ConnectionExpanded = Z.infer<typeof zConnectionExpanded>

export const zConnectionReadParams = z.object({
  include_secrets: zIncludeSecrets.optional(),
  expand: zCoerceArray(zConnectionExpandOption).optional().default([]),
  // refresh_policy: zRefreshPolicy.optional().default('auto'),
})

export function expandConnection(
  connection: Core['connection_select'],
  expand: Array<Z.infer<typeof zConnectionExpandOption>> = [],
) {
  if (!expand.includes('connector')) {
    return connection
  }

  const connector =
    defConnectors[connection.connector_name as keyof typeof defConnectors]
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found for connection ${connection['id']}`,
    })
  }

  return {
    ...connection,
    connector: getConnectorModelByName(
      connection.connector_name as ConnectorName,
    ),
  }
}
