/* eslint-disable jest/no-conditional-expect */
// import {node} from '@elysiajs/node'
import {Elysia} from 'elysia'
import {
  elysiaStartServer,
  nodeServerFromHandler,
} from '@openint/loopback-link/elysia-utils'
import {detectRuntime} from '@openint/util/__tests__/test-utils'

const {isNode} = detectRuntime()

const app = new Elysia()
  .get('/', () => new Response('ok'))
  .mount('/test', async (req) => new Response(await req.text()))
  .all('/test2', async ({request: req}) => new Response(await req.text()))

test('GET /', async () => {
  const res = await app.handle(new Request('http://localhost/'))
  expect(await res.text()).toBe('ok')
})

test('POST to /test should return the request body but crashes for now', async () => {
  const testBody = JSON.stringify({hello: 'world'})
  const response = await app.handle(
    new Request('http://localhost/test', {
      method: 'POST',
      body: testBody,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  )
  const responseBody = await response.text()
  if (isNode) {
    // Does not work on node
    expect(response.status).toBe(500)
    expect(responseBody).toEqual(
      'TypeError: Request with GET/HEAD method cannot have body.',
    )
  } else {
    // works on bun for sure, and maybe others?
    expect(response.status).toBe(200)
    expect(responseBody).toBe(testBody)
  }
})

test('POST to /test2 should return the request body', async () => {
  const testBody = JSON.stringify({hello: 'world'})
  const response = await app.handle(
    new Request('http://localhost/test2/', {
      method: 'POST',
      body: testBody,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  )

  const responseBody = await response.text()
  // console.log(responseBody)
  expect(response.status).toBe(200)
  expect(responseBody).toBe(testBody)
})

test('listen on random random port and handling request', async () => {
  if (isNode) {
    const server = await nodeServerFromHandler(app.handle).start()
    const response = await fetch(`http://localhost:${server.port}`)
    expect(response.status).toBe(200)
    await server.stop()
  } else {
    const server = await elysiaStartServer(app)
    const response = await fetch(`http://localhost:${server.port}`)
    expect(response.status).toBe(200)
    await server.stop()
  }
})
