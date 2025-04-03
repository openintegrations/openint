import {initTRPC} from '@trpc/server'
import {
  createOpenApiFetchHandler,
  generateOpenApiDocument,
  type OpenApiMeta,
} from 'trpc-to-openapi'
import {z, zCoerceBoolean} from '@openint/util/zod-utils'

const trpc = initTRPC.meta<OpenApiMeta>().create()
const zExpand = z.enum([
  'integration',
  'connector_config',
  'connector_config.connector',
  'integration.connector',
])
const router = trpc.router({
  arrayParams: trpc.procedure
    .meta({openapi: {method: 'GET', path: '/array-params'}})
    .input(z.object({expand: z.array(zExpand), boolAsString: zCoerceBoolean()}))
    .output(z.object({expand: z.array(zExpand)}))
    .query(({input}) => {
      return input
    }),
})
const handler = (req: Request) =>
  createOpenApiFetchHandler({endpoint: '/', req, router})
test('handle single value', async () => {
  const res = await handler(
    new Request('http://localhost:3000/array-params?expand=integration'),
  )
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({expand: ['integration']})
})
test('handle multiple values', async () => {
  const res = await handler(
    new Request(
      'http://localhost:3000/array-params?expand=integration&expand=connector_config',
    ),
  )
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({
    expand: ['integration', 'connector_config'],
  })
})
test('oas spec', async () => {
  const oas = generateOpenApiDocument(router, {
    title: 'test',
    version: '0.0.0',
    baseUrl: 'http://localhost:3000',
  })
  expect(oas.paths?.['/array-params']?.get?.parameters).toMatchInlineSnapshot(`
    [
      {
        "in": "query",
        "name": "expand",
        "required": true,
        "schema": {
          "items": {
            "enum": [
              "integration",
              "connector_config",
              "connector_config.connector",
              "integration.connector",
            ],
            "type": "string",
          },
          "type": "array",
        },
      },
      {
        "in": "query",
        "name": "boolAsString",
        "schema": {
          "type": "boolean",
        },
      },
    ]
  `)
})
