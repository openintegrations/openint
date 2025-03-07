import {applyLinks} from '@opensdks/fetch-links'
import Elysia from 'elysia'
import {detectRuntime} from '@openint/util/__tests__/test-utils'
import {loopbackLink} from '.'
import {serverFromElysia, serverFromHandler} from './server-utils'

const servers = {
  node: serverFromHandler(async (req) => new Response(await req.text())),
  web: serverFromElysia(
    new Elysia().all(
      '*',
      async ({request: req}) => new Response(await req.text()),
    ),
  ),
}

test.each(
  Object.entries(servers).filter(
    ([name]) => !(name === 'web' && detectRuntime().isNode),
  ),
)('server echo: %s', async (_name, server) => {
  await server.startIfNeeded()

  const res = await fetch(`http://localhost:${server.port}/`, {
    method: 'POST',
    body: JSON.stringify({foo: 'bar'}),
    headers: {'Content-Type': 'application/json'},
  })

  expect(await res.json()).toMatchObject({foo: 'bar'})
  await server.stop()
})

const handler = (req: Request) =>
  applyLinks(req, [
    loopbackLink(),
    async (req) =>
      new Response(await req.text(), {
        headers: {
          'x-loopback': 'true',
          'content-type': req.headers.get('content-type') ?? 'text/plain',
        },
      }),
  ])

test('GET request', async () => {
  const res = await handler(new Request('http://localhost/api/health'))
  expect(await res.text()).toBe('')
  expect(res.headers.get('content-type')).toBe('text/plain')
  expect(res.headers.get('x-loopback')).toBe('true')
})

test('POST request', async () => {
  const res = await handler(
    new Request('http://localhost/api/health', {
      method: 'POST',
      body: JSON.stringify({foo: 'bar'}),
      headers: {'Content-Type': 'application/json'},
    }),
  )

  expect(await res.json()).toMatchObject({foo: 'bar'})
  expect(res.headers.get('content-type')).toBe('application/json')
  expect(res.headers.get('x-loopback')).toBe('true')
})
