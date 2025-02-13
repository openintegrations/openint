import {z} from 'zod'
import {extendZodWithOpenApi} from 'zod-openapi'

extendZodWithOpenApi(z)

// TODO: Import these from the corresponding connector packages...
const plaid = {
  connection: z
    .object({
      connector_name: z.literal('plaid'),
      secrets: z.object({
        access_token: z.string(),
      }),
      settings: z.object({
        item_id: z.string(),
      }),
    })
    .openapi({ref: 'plaid.connection', description: 'Plaid Connection'}),
  connector_config: z
    .object({
      connector_name: z.literal('plaid'),
      secrets: z.object({
        client_id: z.string(),
        client_secret: z.string(),
      }),
      config: z.object({
        client_name: z.string(),
        products: z.array(z.enum(['transactions', 'balances'])),
      }),
    })
    .openapi({
      ref: 'plaid.connector_config',
      description: 'Plaid Connector Config',
    }),
}

const greenhouse = {
  connection: z
    .object({
      connector_name: z.literal('greenhouse'),
      secrets: z.object({
        api_key: z.string(),
      }),
      settings: z.object({}),
    })
    .openapi({
      ref: 'greenhouse.connection',
      description: 'Greenhouse Connection',
    }),
  connector_config: z
    .object({
      connector_name: z.literal('greenhouse'),
      secrets: z.object({}),
      config: z.object({}),
    })
    .openapi({
      ref: 'greenhouse.connector_config',
      description: 'Greenhouse Connector Config',
    }),
}

const coreBase = z.object({
  id: z.string(),
  updated_at: z.string().datetime(),
  created_at: z.string().datetime(),
})

export const core = {
  connection: z
    .intersection(
      coreBase.describe('Connection Base'),
      z
        .discriminatedUnion('connector_name', [
          plaid.connection,
          greenhouse.connection,
        ])
        .describe('Connector specific data'),
    )
    .openapi({ref: 'core.connection', title: 'Connection'}),

  connector_config: z
    .intersection(
      coreBase.describe('Connector Config Base'),
      z
        .discriminatedUnion('connector_name', [
          plaid.connector_config,
          greenhouse.connector_config,
        ])
        .describe('Connector specific data'),
    )
    .openapi({
      ref: 'core.connector_config',
      title: 'Connector Config',
    }),
}
