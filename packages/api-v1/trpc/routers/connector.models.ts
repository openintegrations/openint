import type {ConnectorName} from '@openint/all-connectors/name'
import type {ConnectorDef} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'

import {defConnectors} from '@openint/all-connectors/connectors.def'
import {zConnectorName} from '@openint/all-connectors/name'
import {jsonSchemasByConnectorName} from '@openint/all-connectors/schemas'
import {zConnectorSchemas} from '@openint/cdk'
import {getConnectorDefaultCredentials, isProduction} from '@openint/env'
import {titleCase} from '@openint/util/string-utils'
import {z} from '@openint/util/zod-utils'

export const zConnector = z.object({
  name: z.string(),
  display_name: z.string().optional(),
  logo_url: z.string().optional(),
  stage: z.enum(['alpha', 'beta', 'ga', 'hidden']).optional(),
  platforms: z
    // TODO: Fix me to be the right ones
    .array(z.enum(['web', 'mobile', 'desktop', 'local', 'cloud']))
    .optional(),
  schemas: zConnectorSchemas.optional(),
  auth_type: z
    // custom should be considered to be default
    .enum(['BASIC', 'OAUTH1', 'OAUTH2', 'OAUTH2CC', 'API_KEY', 'CUSTOM'])
    .optional(),
  // FIX ME: This should be nested under auth
  required_scopes: z.array(z.string()).optional(),
  openint_default_scopes: z.array(z.string()).optional(),
  openint_allowed_scopes: z.array(z.string()).optional(),
  scopes: z
    .array(
      z.object({
        scope: z.string(),
        display_name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  has_openint_credentials: z.boolean().optional(),
})

export {zConnectorName, type ConnectorName}

export function getConnectorModelByName(
  name: string, // ConnectorName
  opts: {includeSchemas?: boolean} = {},
): Z.infer<typeof zConnector> {
  const def = defConnectors[name as keyof typeof defConnectors]
  if (!def) {
    throw new Error(`Connector not found: ${name}`)
  }
  return getConnectorModel(def, opts)
}

export const getConnectorModel = (
  def: ConnectorDef,
  opts: {includeSchemas?: boolean} = {},
): Z.infer<typeof zConnector> => {
  return {
    name: def.name,
    display_name: def.metadata?.displayName ?? titleCase(def.name),
    // TODO: replace this with our own custom domain later
    logo_url: def.metadata?.logoUrl?.startsWith('http')
      ? def.metadata?.logoUrl
      : isProduction
        ? `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public${def.metadata?.logoUrl}`
        : def.metadata?.logoUrl,
    stage: def.metadata?.stage,
    platforms: def.metadata?.platforms,
    auth_type: def.metadata?.authType ?? 'CUSTOM',
    // verticals: def.metadata?.verticals ?? ['other'],
    // authType: def.metadata?.authType,

    // hasPreConnect: def.preConnect != null,
    // hasUseConnectHook: def.useConnectHook != null
    schemas: opts.includeSchemas
      ? jsonSchemasByConnectorName[def.name as ConnectorName]
      : undefined,
    required_scopes:
      def.metadata?.jsonDef?.auth?.type === 'OAUTH2'
        ? def.metadata?.jsonDef?.auth?.required_scopes
        : undefined,
    openint_default_scopes:
      def.metadata?.jsonDef?.auth?.type === 'OAUTH2'
        ? def.metadata?.jsonDef?.auth?.openint_default_scopes
        : undefined,
    openint_allowed_scopes:
      def.metadata?.jsonDef?.auth?.type === 'OAUTH2'
        ? def.metadata?.jsonDef?.auth?.openint_allowed_scopes
        : undefined,
    scopes:
      def.metadata?.jsonDef?.auth?.type === 'OAUTH2'
        ? def.metadata?.jsonDef?.auth?.scopes
        : undefined,
    has_openint_credentials:
      getConnectorDefaultCredentials(def.name) !== undefined,
  }
}
