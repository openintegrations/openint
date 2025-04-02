import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const jiraSchemas = {
  name: z.literal('jira'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const jiraHelpers = connHelpers(jiraSchemas)

export const jiraDef = {
  name: 'jira',
  schemas: jiraSchemas,
  metadata: {
    displayName: 'Jira',
    stage: 'beta',
    verticals: ['ticketing'],
    logoUrl: '/_assets/logo-jira.svg',
    nangoProvider: 'jira',
  },
} satisfies ConnectorDef<typeof jiraSchemas>

export default jiraDef
