/* eslint-disable jest/no-conditional-expect */
import {node} from '@elysiajs/node'
import {Elysia} from 'elysia'
import {$beforeAll, detectRuntime} from '@openint/util/__tests__/test-utils'

const {isNode} = detectRuntime()

const app = new Elysia({adapter: isNode ? node() : undefined})
  .get('/', () => new Response('ok'))
  .mount('/test', async (req) => new Response(await req.text()))
  .all('/test2', async ({request: req}) => new Response(await req.text()))

/** 0 means random, but not supported by node adapter */
const listenWithPort = (app: Elysia, port = 0) =>
  new Promise<number>((resolve) => {
    app.listen(port, (server) => {
      resolve(server.port)
    })
  })

const getRandomPort = (min = 10000, max = 65535) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const portRef = $beforeAll(() =>
  // in node.js, elysia needs to call listen before .handle otherwise
  // we get TypeError: Cannot read properties of undefined (reading 'writeHead')
  isNode ? listenWithPort(app, getRandomPort()) : undefined,
)

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
  if (detectRuntime().isNode) {
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

test('listen on random port', async () => {
  if (isNode) {
    const response = await fetch(`http://localhost:${portRef.current}`)
    expect(response.status).toBe(200)
  } else {
    const port = await listenWithPort(app)
    const response = await fetch(`http://localhost:${port}`)
    expect(response.status).toBe(200)
  }
})
