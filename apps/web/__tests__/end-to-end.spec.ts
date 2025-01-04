/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import plaidSdkDef, {initPlaidSDK} from '@opensdks/sdk-plaid'
import {drizzle, eq, schema, sql} from '@openint/db'
import {createAppTrpcClient} from '@openint/engine-frontend/lib/trpcClient'
import {env, testEnv, testEnvRequired} from '@openint/env'
import {initOpenIntSDK} from '@openint/sdk'
import {setupTestOrg, tearDownTestOrg} from './test-utils'

jest.setTimeout(30 * 1000) // long timeout because we have to wait for next.js to compile

let fixture: Awaited<ReturnType<typeof setupTestOrg>>
let sdk: ReturnType<typeof initOpenIntSDK>

let trpc: ReturnType<typeof createAppTrpcClient>

const db = drizzle(env.DATABASE_URL, {logger: true, schema})
async function setupTestDb(dbName: string) {
  await db.execute(`DROP DATABASE IF EXISTS ${dbName}`)
  await db.execute(`CREATE DATABASE ${dbName}`)
  const url = new URL(env.DATABASE_URL)
  url.pathname = `/${dbName}`
  console.log('setupTestDb url:', url.toString())
  console.log(url.toString())
  return {url, db: drizzle(url.toString(), {logger: true})}
}

beforeAll(async () => {
  fixture = await setupTestOrg()
  sdk = initOpenIntSDK({
    headers: {'x-apikey': fixture.apiKey},
    baseUrl: 'http://localhost:4000/api/v0',
  })
  trpc = createAppTrpcClient({
    apiUrl: 'http://localhost:4000/api/trpc',
    headers: {'x-apikey': fixture.apiKey},
  })
})

afterAll(async () => {
  if (!testEnv.DEBUG) {
    await tearDownTestOrg(fixture)
    await db.execute(`DROP DATABASE IF EXISTS test_${fixture.testId}`)
  }
})

let testDb: Awaited<ReturnType<typeof setupTestDb>>

test('setup organization default destination', async () => {
  testDb = await setupTestDb(`test_${fixture.testId}`)

  await sdk.PATCH('/viewer/organization', {
    body: {
      publicMetadata: {
        database_url: testDb.url.toString(),
      },
    },
  })

  const org = await sdk.GET('/viewer/organization').then((r) => r.data)
  expect(org.publicMetadata.database_url).toEqual(testDb.url.toString())
})

test('create and sync plaid connection', async () => {
  const connConfig = await sdk
    .POST('/core/connector_config', {
      body: {
        orgId: fixture.org.id,
        connectorName: 'plaid',
        config: {
          envName: 'sandbox',
          products: ['transactions'],
          countryCodes: ['US'],
          language: 'en',
          clientName: 'OpenInt Test',
          credentials: null, // use platform credentials
        },
        defaultPipeOut: {
          streams: {account: true, transaction: true},
          links: ['unified_banking'],
        },
      },
    })
    .then((r) => r.data)

  const plaid = initPlaidSDK({
    baseUrl: plaidSdkDef.oasMeta.servers[1].url,
    headers: {
      'PLAID-CLIENT-ID': testEnvRequired.ccfg_plaid__CLIENT_ID,
      'PLAID-SECRET': testEnvRequired.ccfg_plaid__CLIENT_SECRET_SANDBOX,
    },
  })
  const sandboxTokenRes = await plaid['/sandbox/public_token/create'].POST({
    body: {initial_products: ['transactions'], institution_id: 'ins_21'},
  })

  const postConnectRes = await trpc.postConnect.mutate([
    {
      publicToken: sandboxTokenRes.data.public_token,
      meta: {
        link_session_id: '327157e8-b91d-49da-aaf7-bd93b3adea31',
        institution: {
          name: 'Huntington Bank',
          institution_id: 'ins_21',
        },
        accounts: [],
      },
    },
    connConfig.id,
    {},
  ])

  console.log('[endToEnd] postConnectRes', postConnectRes)
  const connId = postConnectRes.connectionId!

  await sdk.POST('/core/connection/{id}/_sync', {
    body: {async: false},
    params: {path: {id: connId}},
  })

  const rows = await testDb.db.execute(sql`SELECT * FROM banking_transaction`)
  expect(rows[0]).toMatchObject({
    source_id: connId,
    id: expect.any(String),
    customer_id: null,
    created_at: expect.any(String),
    updated_at: expect.any(String),
    connector_name: 'plaid',
    unified: expect.any(Object),
    raw: expect.any(Object),
  })
})

test('create and sync greenhouse connection', async () => {
  const connConfig = await sdk
    .POST('/core/connector_config', {
      body: {
        orgId: fixture.org.id,
        connectorName: 'greenhouse',
        defaultPipeOut: {
          streams: {job: true, candidate: true},
          // TODO: Get sync with no unification to also work
          // May need to work around drizzle-kit issues though
          links: ['unified_ats'],
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
  console.log('[endToEnd] connId', connId)

  const syncRes = await sdk.POST('/core/connection/{id}/_sync', {
    body: {async: false},
    params: {path: {id: connId}},
  })

  const rows = await testDb.db.execute(sql`SELECT * FROM job`)
  expect(rows[0]).toMatchObject({
    source_id: connId,
    id: expect.any(String),
    customer_id: null,
    created_at: expect.any(String),
    updated_at: expect.any(String),
    connector_name: 'greenhouse',
    unified: expect.any(Object),
    raw: expect.any(Object),
  })

  const syncCompletedEvent = await db.query.event.findFirst({
    where: eq(
      schema.event.id,
      syncRes.data.pipeline_syncs?.[0]?.sync_completed_event_id ?? '',
    ),
  })
  expect(syncCompletedEvent).toMatchObject({
    name: 'sync.completed',
    data: {source_id: connId},
  })
})
