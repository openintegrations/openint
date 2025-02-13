import {app} from './app'

test('elysia route', async () => {
  const res = await app.handle(new Request('http://localhost/health'))
  expect(await res.json()).toBeTruthy()
})

test('openapi route', async () => {
  const res = await app.handle(new Request('http://localhost/api/v1/health'))
  expect(await res.json()).toBeTruthy()
})

test('trpc route', async () => {
  const res2 = await app.handle(new Request('http://localhost/api/trpc/health'))
  expect(await res2.json()).toBeTruthy()
})
