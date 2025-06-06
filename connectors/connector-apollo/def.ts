import type {ConnectorDef, ConnectorSchemas, OpenApiSpec} from '@openint/cdk'

import oas from '@opensdks/sdk-apollo/apollo.oas.json'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const APOLLO_ENTITY_NAME = ['contact', 'account'] as const

export const apolloSchemas = {
  name: z.literal('apollo'),
  connection_settings: z.object({
    api_key: z.string(),
  }),
} satisfies ConnectorSchemas

export const apolloHelpers = connHelpers(apolloSchemas)

export const apolloDef = {
  name: 'apollo',
  schemas: apolloSchemas,
  metadata: {
    verticals: ['sales-engagement'],
    displayName: 'Apollo',
    stage: 'beta',
    logoUrl: '/_assets/logo-apollo.svg',
    openapiSpec: {proxied: oas as OpenApiSpec},
  },
} satisfies ConnectorDef<typeof apolloSchemas>

export default apolloDef
