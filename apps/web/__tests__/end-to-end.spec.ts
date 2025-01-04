/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {drizzle, sql} from '@openint/db'
import {env, testEnv} from '@openint/env'
import {initOpenIntSDK} from '@openint/sdk'
import {setupTestOrg} from './test-utils'

jest.setTimeout(30 * 1000) // long timeout because we have to wait for next.js to compile

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
  return {url, db: drizzle(url.toString(), {logger: true})}
}

beforeAll(async () => {
  fixture = await setupTestOrg()
  sdk = initOpenIntSDK({
    headers: {'x-apikey': fixture.apiKey},
    baseUrl: 'http://localhost:4000/api/v0',
  })
})

test('create connector config and connections happy path', async () => {
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
          links: ['unified_ats'],
        },
      },
    })
    .then((r) => r.data)

  const body = {
    connectorConfigId: connConfig.id,
    settings: {apiKey: testEnv.conn_greenhouse_API_KEY},
    displayName: 'displayName',
    disabled: false,
    metadata: {
      key: 'value',
    },
    customerId: 'fooCustomerId',
  }
  const {data: connId} = await sdk.POST('/core/connection', {
    body,
  })
  console.log('[endToEnd] connId', connId)

  const {data: conn} = await sdk.GET('/core/connection/{id}', {
    params: {
      path: {
        id: connId,
      },
    },
  })

  // TODO: add positive test scenario for integrationId
  expect(conn.id).toMatch(connId)
  expect(conn.connectorConfigId).toMatch(body.connectorConfigId)
  expect(conn.settings).toMatchObject(body.settings)
  expect(conn.displayName).toMatch(body.displayName)
  expect(conn.disabled).toEqual(body.disabled)
  expect(conn.metadata).toMatchObject(body.metadata)
  expect(conn.customerId).toMatch(body.customerId)

  await sdk.POST('/core/connection/{id}/_sync', {
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
})

test('create connector config with bad parameters fail ', async () => {
  const ccfg1 = await sdk.POST('/core/connector_config', {
    body: {
      orgId: fixture.org.id,
      connectorName: 'foo',
      defaultPipeOut: {
        streams: {job: true, candidate: true},
      },
    },
  })
  expect(ccfg1.error).toBeTruthy()

  const ccfg2 = await sdk.POST('/core/connector_config', {
    body: {
      orgId: fixture.org.id,
      connectorName: 'greenhouse',
      defaultPipeOut: {
        streams: {michael: true},
      },
    },
  })
  expect(ccfg2.error).toBeTruthy()

  const ccfg3 = await sdk.POST('/core/connector_config', {
    body: {
      orgId: 'micasa',
      connectorName: 'greenhouse',
      defaultPipeOut: {
        streams: {job: true, candidate: true},
      },
    },
  })
  expect(ccfg3.error).toBeTruthy()

  const ccfg4 = await sdk.POST('/core/connector_config', {
    body: {
      orgId: fixture.org.id,
      connectorName: 'greenhouse',
    },
  })
  expect(ccfg4.error).toBeTruthy()
})

test('Edit organization with bad parameters fails  ', async () => {
  const testDb = await setupTestDb(`test_${fixture.testId}`)

  const org1 = await sdk.PATCH('/viewer/organization', {
    body: {
      publicMetadata: {
        database_url: testDb.url.toString(),
        // @ts-expect-error
        foo: 'value',
      },
    },
  })

  expect(org1.error).toBeTruthy()

  const org2 = await sdk.PATCH('/viewer/organization', {
    body: {
      publicMetadata: {
        // @ts-expect-error
        database_url: {},
      },
    },
  })

  expect(org2.error).toBeTruthy()

  const org3 = await sdk.PATCH('/viewer/organization', {
    body: {
      publicMetadata: {
        // @ts-expect-error
        migrate_tables: {},
      },
    },
  })

  expect(org3.error).toBeTruthy()

  const org4 = await sdk.PATCH('/viewer/organization', {
    // @ts-expect-error
    body: {},
  })

  expect(org4.error).toBeTruthy()
})

test('create connections with bad parameters', async () => {
  const connConfig = await sdk
    .POST('/core/connector_config', {
      body: {
        orgId: fixture.org.id,
        connectorName: 'greenhouse',
      },
    })
    .then((r) => r.data)

  const res2 = await sdk.POST('/core/connection', {
    body: {
      connectorConfigId: connConfig.id,
      settings: {apiKey: 'fooApiKey'},
    },
  })

  expect(res2.error).toBeTruthy()

  const res3 = await sdk.POST('/core/connection', {
    // @ts-expect-error
    body: {},
  })
  expect(res3.error).toBeTruthy()

  let body = {
    connectorConfigId: connConfig.id,
    settings: {apiKey: testEnv.conn_greenhouse_API_KEY},
    displayName: 'displayName',
    disabled: false,
    metadata: {
      key: 'value',
    },
  }
  const res4 = await sdk.POST('/core/connection', {
    body: {
      ...body,
      // @ts-ignore
      settings: 'foo',
    },
  })
  expect(res4.error).toBeTruthy()

  const res5 = await sdk.POST('/core/connection', {
    body: {
      ...body,
      // TODO
      displayName: randomString(999),
    },
  })
  expect(res5.error).toBeTruthy()

  const res6 = await sdk.POST('/core/connection', {
    body: {
      ...body,
      // @ts-expect-error
      disabled: {},
    },
  })
  expect(res6.error).toBeTruthy()

  const res7 = await sdk.POST('/core/connection', {
    body: {
      ...body,
      metadata: 'foo',
    },
  })
  expect(res7.error).toBeTruthy()

  const res8 = await sdk.POST('/core/connection', {
    body: {
      ...body,
      customerId: randomString(999),
    },
  })
  expect(res8.error).toBeTruthy()

  const res9 = await sdk.POST('/core/connection', {
    body: {
      ...body,
      integrationId: 'foo',
    },
  })
  expect(res9.error).toBeTruthy()
})
