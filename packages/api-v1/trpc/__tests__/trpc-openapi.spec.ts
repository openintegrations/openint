import type {OpenApiMeta} from 'trpc-to-openapi'

import {initTRPC} from '@trpc/server'
import {
  createOpenApiFetchHandler,
  generateOpenApiDocument,
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
  postEndpoint: trpc.procedure
    .meta({openapi: {method: 'POST', path: '/post-endpoint/{id}'}})
    .input(z.object({id: z.string()}))
    .output(z.unknown())
    .mutation(({input}) => {
      return input
    }),
  postEndpointIndex: trpc.procedure
    .meta({openapi: {method: 'POST', path: '/post-endpoint'}})
    .input(z.object({}))
    .output(z.unknown())
    .mutation(({input}) => {
      return {...input, index: true}
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

// eslint-disable-next-line jest/no-disabled-tests
test.skip('fails post endpoint for bad content type', async () => {
  // Fails but not jest also crashes...
  await expect(
    handler(
      new Request('http://localhost:3000/post-endpoint/123', {
        method: 'POST',
        // headers: {'Content-Type': 'text/plain'},
      }),
    ),
  ).rejects.toThrow()

  await expect(
    handler(
      new Request('http://localhost:3000/post-endpoint/123', {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'},
      }),
    ),
  ).rejects.toThrow()
})

test('handle post endpoint', async () => {
  const res = await handler(
    new Request('http://localhost:3000/post-endpoint/123', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({}),
    }),
  )
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({id: '123'})
})

test('handle post endpoint index always requires actual JSON body...', async () => {
  const res = await handler(
    new Request('http://localhost:3000/post-endpoint', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({}),
    }),
  )
  expect(res.status).toBe(200)
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
