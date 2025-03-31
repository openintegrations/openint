import createClient, {wrapAsPathBasedClient} from 'openapi-fetch'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import type {paths} from '../__generated__/openapi.types'
import {createApp} from '../app'
import {createTestOrganization} from './test-utils'

describeEachDatabase({drivers: ['pglite'], migrate: true}, async (db) => {
  const app = createApp({db})

  const _inMemoryClient = createClient<paths>({
    baseUrl: 'http://localhost/v1',
    fetch: app.handle,
  })

  const clients = {
    inMemory: wrapAsPathBasedClient(_inMemoryClient),

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

  let testOrgApiKey: string

  beforeAll(async () => {
    testOrgApiKey = await createTestOrganization(db).then((org) => org.api_key!)
    _inMemoryClient.use({
      onRequest: ({request}) => {
        request.headers.set('Authorization', `Bearer ${testOrgApiKey}`)
      },
    })
  })

  test('health check', async () => {
    const res2 = await client['/health'].GET()
    expect(res2.data).toBeTruthy()
  })

  test('list connections', async () => {
    const res = await client['/connection'].GET()
    // console.log('error', res.error)
    expect(res.data).toBeTruthy()
    // console.log('res.data', res.data)
  })
})
