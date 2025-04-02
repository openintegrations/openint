import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, zCcfgAuth} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const stripeSchemas = {
  name: z.literal('stripe'),
  connectorConfig: zCcfgAuth.oauthOrApikeyAuth,
  connectionSettings: z.object({secretKey: z.string()}),
} satisfies ConnectorSchemas

export const stripeDef = {
  schemas: stripeSchemas,
  name: 'stripe',
  metadata: {
    verticals: ['commerce'],
    logoUrl: '/_assets/logo-stripe.svg',
    stage: 'beta',
  },
} satisfies ConnectorDef<typeof stripeSchemas>

export const helpers = connHelpers(stripeSchemas)

export default stripeDef
