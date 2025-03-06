/* eslint-disable jest/no-conditional-expect */
import {Elysia} from 'elysia'
import {detectRuntime} from '@openint/util/__tests__/test-utils'

const app = new Elysia()
  .mount('/test', async (req) => new Response(await req.text()))
  .all('/test2', async ({request: req}) => new Response(await req.text()))

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

test.skip('listen', async () => {
  app.listen(3555)
  const response = await fetch('http://localhost:3555/test')
  expect(response.status).toBe(200)
})
