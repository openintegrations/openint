import {Elysia} from 'elysia'

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
  expect(response.status).toBe(500)
  const responseBody = await response.text()
  expect(responseBody).toEqual(
    'TypeError: Request with GET/HEAD method cannot have body.',
  )
  // console.log(responseBody)
  // expect(response.status).toBe(200)
  // expect(responseBody).toBe(testBody)
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
