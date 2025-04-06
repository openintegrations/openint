import {defConnectors} from '@openint/all-connectors/connectors.def'
import type {ConnectorName} from '@openint/all-connectors/name'
import {zConnectorName} from '@openint/all-connectors/name'
import {jsonSchemasByConnectorName} from '@openint/all-connectors/schemas'
import {zConnectorSchemas, type ConnectorDef} from '@openint/cdk'
import {titleCase} from '@openint/util/string-utils'
import {urlFromImage} from '@openint/util/url-utils'
import {z, type Z} from '@openint/util/zod-utils'

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
  authType: z
    // custom should be considered to be default
    .enum(['BASIC', 'OAUTH1', 'OAUTH2', 'OAUTH2CC', 'API_KEY', 'CUSTOM'])
    .optional(),
  // FIX ME: This should be nested under auth
  openint_scopes: z.array(z.string()).optional(),
  scopes: z
    .array(
      z.object({
        scope: z.string(),
        display_name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
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
  const logoUrl = def.metadata?.logoSvg
    ? urlFromImage({type: 'svg', data: def.metadata?.logoSvg})
    : def.metadata?.logoUrl
  return {
    name: def.name,
    display_name: def.metadata?.displayName ?? titleCase(def.name),
    // TODO: replace this with our own custom domain later
    logo_url: logoUrl?.startsWith('http')
      ? logoUrl
      : `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public${logoUrl}`,
    stage: def.metadata?.stage ?? 'alpha',
    platforms: def.metadata?.platforms ?? ['cloud', 'local'],
    authType: def.metadata?.authType ?? 'CUSTOM',
    // verticals: def.metadata?.verticals ?? ['other'],
    // authType: def.metadata?.authType,

    // hasPreConnect: def.preConnect != null,
    // hasUseConnectHook: def.useConnectHook != null,
    // TODO: Maybe nangoProvider be more explicit as a base provider?
    // hasPostConnect: def.postConnect != null || def.metadata?.nangoProvider,
    // nangoProvider: def.metadata?.nangoProvider,
    schemas: opts.includeSchemas
      ? jsonSchemasByConnectorName[def.name as ConnectorName]
      : undefined,
    openint_scopes:
      def.metadata?.jsonDef?.auth.type === 'OAUTH2'
        ? def.metadata?.jsonDef?.auth.openint_scopes
        : undefined,
    scopes:
      def.metadata?.jsonDef?.auth.type === 'OAUTH2'
        ? def.metadata?.jsonDef?.auth.scopes
        : undefined,
  }
}
