import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import {zAirtableResourceSettings} from './AirtableClient'

export const airtableSchemas = {
  name: z.literal('airtable'),
  connectionSettings: zAirtableResourceSettings,
} satisfies ConnectorSchemas

export const helpers = connHelpers(airtableSchemas)

export const airtableDef = {
  metadata: {
    verticals: ['database'],
    logoUrl: '/_assets/logo-airtable.svg',
  },
  name: 'airtable',
  schemas: airtableSchemas,
} satisfies ConnectorDef<typeof airtableSchemas>

export default airtableDef
