import {applyLinks} from '@opensdks/fetch-links'
import {loopbackLink} from '.'

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
