import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const githubSchemas = {
  name: z.literal('github'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const githubHelpers = connHelpers(githubSchemas)

export const githubDef = {
  name: 'github',
  schemas: githubSchemas,
  metadata: {
    displayName: 'GitHub',
    stage: 'beta',
    verticals: ['other'],
    logoUrl: '/_assets/logo-github.svg',
    nangoProvider: 'github',
  },
} satisfies ConnectorDef<typeof githubSchemas>

export default githubDef
