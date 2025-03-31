import createClient, {wrapAsPathBasedClient} from 'openapi-fetch'
import {initDbPGLite} from '@openint/db/db.pglite'
import type {paths} from '../__generated__/openapi.types'
import {createApp} from '../app'

const db = initDbPGLite()
const app = createApp({db})

const clients = {
  inMemory: wrapAsPathBasedClient(
    createClient<paths>({
      baseUrl: 'http://localhost/v1',
      fetch: app.handle,
    }),
  ),
  localhost: wrapAsPathBasedClient(
    createClient<paths>({
      baseUrl: 'http://localhost:4000/api/v1',
      headers: {
        Authorization: `Bearer ${process.env['OPENINT_API_KEY']}`,
      },
    }),
  ),
}

const client = process.env['OPENINT_API_KEY']
  ? clients.localhost
  : clients.inMemory

test('health check', async () => {
  const res2 = await client['/health'].GET()
  expect(res2.data).toBeTruthy()
})

test('list connections', async () => {
  const res = await client['/connection'].GET()
  expect(res.data).toBeTruthy()
  
  console.log('res.data', res.data)
})
