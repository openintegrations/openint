import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const openLedgerSchemas = {
  name: z.literal('openledger'),
  connector_config: z.object({
    developer_id: z.string().describe('Your developer ID for authentication'),
    developer_secret: z.string().describe('Your developer secret'),
    environment: z
      .enum(['development', 'production'])
      .describe('Switch to "production" for live data'),
    api_url: z.string().url().describe('API endpoint'),
  }),
  connection_settings: z.object({
    entity_id: z.string().describe("Your entity's identifier, aka customer ID"),
  }),

  connect_input: z.object({
    entity_id: z.string().describe("Your entity's identifier, aka customer ID"),
  }),
  connect_output: z.object({
    entity_id: z.string().describe("Your entity's identifier, aka customer ID"),
  }),
} satisfies ConnectorSchemas

export const helpers = connHelpers(openLedgerSchemas)

export const openLedgerDef = {
  name: 'openledger',
  schemas: openLedgerSchemas,
  metadata: {
    verticals: ['banking', 'accounting'],
    displayName: 'OpenLedger',
    stage: 'ga',

    logoUrl: '/_assets/logo-openledger.svg',
  },
} satisfies ConnectorDef<typeof openLedgerSchemas>

export default openLedgerDef
