import {createTRPCClient, httpLink} from '@trpc/client'
import {app} from './app'
import type {AppRouter} from './trpc/routers'

test('elysia route', async () => {
  const res = await app.handle(new Request('http://localhost/api/health'))
  expect(await res.json()).toBeTruthy()
})

test('openapi route', async () => {
  const res = await app.handle(new Request('http://localhost/api/v1/health'))
  expect(await res.json()).toBeTruthy()
})

test('trpc route', async () => {
  const res2 = await app.handle(
    new Request('http://localhost/api/v1/trpc/health'),
  )
  expect(await res2.json()).toBeTruthy()
})

test('trpc route with TRPCClient', async () => {
  const client = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://localhost/api/v1/trpc',
        fetch: (input, init) => app.handle(new Request(input, init)),
      }),
    ],
  })
  const res = await client.health.query()
  expect(res).toEqual('ok')
})
