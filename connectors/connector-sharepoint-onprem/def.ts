import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {z} from '@openint/util/zod-utils'

export const sharepointOnPremSchema = {
  name: z.literal('sharepoint-onprem'),
  connection_settings: z.object({
    username: z.string(),
    password: z.string(),
    site_url: z.string(),
  }),
} satisfies ConnectorSchemas


export const sharepointOnPremDef = {
  name: 'sharepoint-onprem',
  schemas: sharepointOnPremSchema,
  metadata: {
    displayName: 'SharePoint On-Premise',
    stage: 'alpha',
    verticals: ['ats'],
    logoUrl: '/_assets/logo-sharepoint.svg',
  },
} satisfies ConnectorDef<typeof sharepointOnPremSchema>

export default sharepointOnPremDef
