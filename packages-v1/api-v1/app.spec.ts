import {applyLinks, logLink} from '@opensdks/fetch-links'
import {createTRPCClient, httpLink} from '@trpc/client'
import createClient, {wrapAsPathBasedClient} from 'openapi-fetch'
import type {CustomerId, Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {envRequired} from '@openint/env'
import type {paths} from './__generated__/openapi.types'
import {app} from './app'
import {
  createFetchHandlerOpenAPI,
  createFetchHandlerTRPC,
} from './trpc/handlers'
import type {AppRouter} from './trpc/routers'

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

  test('with OpenAPI client', async () => {
    const openapiClient = createClient<paths>({
      baseUrl: 'http://localhost/api/v1',
      fetch: app.handle,
    })

    const res = await openapiClient.GET('/health')
    expect(res.data).toBeTruthy()

    const pathBasedClient = wrapAsPathBasedClient(openapiClient)
    const res2 = await pathBasedClient['/health'].GET()
    expect(res2.data).toBeTruthy()
  })

  test('with OpenAPI client with links', async () => {
    const openapiClient = createClient<paths>({
      baseUrl: 'http://localhost/api/v1',
      fetch: (req) => applyLinks(req, [logLink(), app.handle]),
    })
    const res = await openapiClient.GET('/health')
    expect(res.data).toBeTruthy()
  })
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

function headerForViewer(viewer: Viewer | null) {
  const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
  return viewer ? {authorization: `Bearer ${jwt.signViewer(viewer)}`} : {}
}

describe('authentication', () => {
  test.each([
    ['anon no header', null],
    ['anon explicit header', {role: 'anon'}],
    ['user', {role: 'user', userId: 'user_123', orgId: 'org_123'}],
    ['org', {role: 'org', orgId: 'org_123'}],
    [
      'customer',
      {role: 'customer', orgId: 'org_123', customerId: 'cus_123' as CustomerId},
    ],
  ] satisfies Array<[string, Viewer | null]>)(
    'viewer as %s',
    async (_desc, viewer) => {
      const client = createTRPCClient<AppRouter>({
        links: [
          httpLink({
            url: 'http://localhost/api/v1/trpc',
            headers: headerForViewer(viewer),
            fetch: (input, init) => app.handle(new Request(input, init)),
          }),
        ],
      })
      const res = await client.viewer.query()
      expect(res).toEqual(viewer ?? {role: 'anon'})
    },
  )
})
