import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const notionSchemas = {
  name: z.literal('notion'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const notionHelpers = connHelpers(notionSchemas)

export const notionDef = {
  name: 'notion',
  schemas: notionSchemas,
  metadata: {
    displayName: 'Notion',
    stage: 'beta',
    verticals: ['flat-files-and-spreadsheets'],
    logoUrl: '/_assets/logo-notion.svg',
    nangoProvider: 'notion',
  },
} satisfies ConnectorDef<typeof notionSchemas>

export default notionDef
