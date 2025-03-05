import {createTRPCClient, httpLink} from '@trpc/client'
import {app} from '../app'
import {
  createFetchHandlerOpenAPI,
  createFetchHandlerTRPC,
} from '../trpc/handlers'
import type {AppRouter} from '../trpc/routers'

test('elysia route', async () => {
  const res = await app.handle(new Request('http://localhost/api/health'))
  expect(await res.json()).toBeTruthy()
})

describe('openapi route', () => {
  test('healthcheck', async () => {
    const res = await app.handle(new Request('http://localhost/api/v1/health'))
    expect(await res.json()).toMatchObject({ok: true})
  })

  test('healthcheck bypass elysia', async () => {
    const handler = createFetchHandlerOpenAPI({endpoint: '/api/v1'})
    const res = await handler(new Request('http://localhost/api/v1/health'))
    expect(await res.json()).toMatchObject({ok: true})
  })

  // AP Note: These endpoints exist but i removed them from the OAS to not expose them in the docs
  // since Mintlify doesn't have a hide feature and setting enabled: false makes them stop working
  //   test('with OpenAPI client', async () => {
  //     const openapiClient = createClient<paths>({
  //       baseUrl: 'http://localhost/api/v1',
  //       fetch: app.handle,
  //     })

  //     const res = await openapiClient.GET('/health')
  //     expect(res.data).toBeTruthy()

  //     const pathBasedClient = wrapAsPathBasedClient(openapiClient)
  //     const res2 = await pathBasedClient['/health'].GET()
  //     expect(res2.data).toBeTruthy()
  //   })

  //   test('with OpenAPI client with links', async () => {
  //     const openapiClient = createClient<paths>({
  //       baseUrl: 'http://localhost/api/v1',
  //       fetch: (req) => applyLinks(req, [logLink(), app.handle]),
  //     })
  //     const res = await openapiClient.GET('/health')
  //     expect(res.data).toBeTruthy()
  //   })
})

describe('trpc route', () => {
  test('healthcheck', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/trpc/health'),
    )
    expect(await res.json()).toMatchObject({result: {data: {ok: true}}})
  })

  test('healthcheck bypass elysia', async () => {
    const handler = createFetchHandlerTRPC({endpoint: '/api/trpc'})
    const res = await handler(new Request('http://localhost/api/trpc/health'))
    expect(await res.json()).toMatchObject({result: {data: {ok: true}}})
  })

  test('with TRPCClient', async () => {
    const client = createTRPCClient<AppRouter>({
      links: [
        httpLink({
          url: 'http://localhost/api/v1/trpc',
          fetch: (input, init) => app.handle(new Request(input, init)),
        }),
      ],
    })
    const res = await client.health.query()
    expect(res).toEqual({ok: true})
  })
})
