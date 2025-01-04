import {drizzle} from '@openint/db'
import {env, testEnv} from '@openint/env'
import {initOpenIntSDK} from '@openint/sdk'
import {setupTestOrg} from './test-utils'

let fixture: Awaited<ReturnType<typeof setupTestOrg>>
let sdk: ReturnType<typeof initOpenIntSDK>

const db = drizzle(env.DATABASE_URL, {logger: true})
async function setupTestDb(dbName: string) {
  await db.execute(`DROP DATABASE IF EXISTS ${dbName}`)
  await db.execute(`CREATE DATABASE ${dbName}`)
  const url = new URL(env.DATABASE_URL)
  url.pathname = `/${dbName}`
  console.log('setupTestDb url:', url.toString())
  console.log(url.toString())
  return {url}
}

beforeAll(async () => {
  fixture = await setupTestOrg()
  sdk = initOpenIntSDK({
    headers: {'x-apikey': fixture.apiKey},
    baseUrl: 'http://localhost:4000/api/v0',
  })
})

test('create connector config', async () => {
  const testDb = await setupTestDb(`test_${fixture.testId}`)

  await sdk.PATCH('/viewer/organization', {
    body: {
      publicMetadata: {
        database_url: testDb.url.toString(),
      },
    },
  })

  const org = await sdk.GET('/viewer/organization').then((r) => r.data)
  expect(org.publicMetadata.database_url).toEqual(testDb.url.toString())

  const connConfig = await sdk
    .POST('/core/connector_config', {
      body: {
        orgId: fixture.org.id,
        connectorName: 'greenhouse',
        defaultPipeOut: {
          streams: {job: true, candidate: true},
          // TODO: Get sync with no unification to also work
          // May need to work around drizzle-kit issues though
          links: ['unified_ats']
        },

      },
    })
    .then((r) => r.data)

  const {data: connId} = await sdk.POST('/core/connection', {
    body: {
      connectorConfigId: connConfig.id,
      settings: {apiKey: testEnv.conn_greenhouse_API_KEY},
    },
  })

  const res = await sdk.POST('/core/connection/{id}/_sync', {
    body: {async: false},
    params: {path: {id: connId}},
  })
  console.log('res', res.data)
})
