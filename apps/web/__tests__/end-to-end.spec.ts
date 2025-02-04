/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import plaidSdkDef, {initPlaidSDK} from '@opensdks/sdk-plaid'
import {drizzle, eq, neon, schema, sql} from '@openint/db'
import {createAppTrpcClient} from '@openint/engine-frontend/lib/trpcClient'
import {env, testEnv, testEnvRequired} from '@openint/env'
import {initOpenIntSDK} from '@openint/sdk'
import {setupTestOrg, tearDownTestOrg} from './test-utils'

jest.setTimeout(30 * 1000) // long timeout because we have to wait for next.js to compile

let fixture: Awaited<ReturnType<typeof setupTestOrg>>
let sdk: ReturnType<typeof initOpenIntSDK>

let trpc: ReturnType<typeof createAppTrpcClient>

const db = drizzle(neon(env.DATABASE_URL), {logger: true, schema})
async function setupTestDb(dbName: string) {
  await db.execute(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`)
  await db.execute(`CREATE DATABASE ${dbName}`)
  const url = new URL(env.DATABASE_URL)
  url.pathname = `/${dbName}`
  console.log('setupTestDb url:', url.toString())
  console.log(url.toString())
  return {url, db: drizzle(neon(url.toString()), {logger: true})}
}

beforeAll(async () => {
  fixture = await setupTestOrg()
  sdk = initOpenIntSDK({
    headers: {'x-apikey': fixture.apiKey},
    // TODO: also test with end user authentication token
    baseUrl: 'http://localhost:4000/api/v0',
  })
  trpc = createAppTrpcClient({
    apiUrl: 'http://localhost:4000/api/trpc',
    // TODO: also test with end user authentication token
    headers: {'x-apikey': fixture.apiKey},
  })
})

afterAll(async () => {
  if (!testEnv.DEBUG) {
    await tearDownTestOrg(fixture)
    // No need to close connections with neon
    // Cannot drop because database connection is still kept open by connector-postgres/server
    // await db.execute(`DROP DATABASE IF EXISTS test_${fixture.testId}`)
  }
})

let testDb: Awaited<ReturnType<typeof setupTestDb>>

test('setup organization default destination', async () => {
  testDb = await setupTestDb(`test_${fixture.testId}`)
  // TODO: Add a separate test for syncing into public schema vs custom schema
  testDb.url.searchParams.set('schema', 'openint')

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

  const connId = postConnectRes.connectionId!

  await sdk.POST('/core/connection/{id}/_sync', {
    body: {async: false},
    params: {path: {id: connId}},
  })

  const rows = await testDb.db.execute(
    sql`SELECT * FROM openint.banking_transaction`,
  )
  expect(rows.rows[0]).toMatchObject({
    source_id: connId,
    id: expect.any(String),
    customer_id: null,
    created_at: expect.any(String),
    updated_at: expect.any(String),
    connector_name: 'plaid',
    unified: expect.any(Object),
    raw: expect.any(Object),
  })

  if (!testEnv.DEBUG) {
    await sdk.DELETE('/core/connection/{id}', {params: {path: {id: connId}}})
  }
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

  const syncRes = await sdk.POST('/core/connection/{id}/_sync', {
    body: {async: false},
    params: {path: {id: connId}},
  })

  const rows = await testDb.db.execute(sql`SELECT * FROM openint.job`)
  expect(rows.rows[0]).toMatchObject({
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

test('list connections', async () => {
  const res = await sdk.GET('/core/connection')

  expect(res.data).toHaveLength(2)
  // Check we have the default postgres connector
  expect(
    res.data.find((c) => c.connectorConfigId.includes('ccfg_postgres_default')),
  ).toBeTruthy()
  // Check we have the greenhouse connector
  expect(
    res.data.find((c) => c.connectorConfigId.includes('ccfg_greenhouse')),
  ).toBeTruthy()

  // Check connection object structure
  expect(res.data[0]).toHaveProperty('connectorName')
  expect(res.data[0]).toHaveProperty('displayName')
  expect(res.data[0]).toHaveProperty('connectorConfigId')
  expect(res.data[0]).toHaveProperty('integrationId')
  expect(res.data[0]).toHaveProperty('settings')
  expect(res.data[0]).toHaveProperty('metadata')
})

test('list connector metas', async () => {
  const res = await sdk.GET('/connector')
  const connectorData = res.data as Record<string, unknown>
  const connector = connectorData['greenhouse']

  expect(Object.keys(connectorData).length).toBeGreaterThan(40)
  // Check basic properties
  expect(connector).toHaveProperty('__typename', 'connector')
  expect(connector).toHaveProperty('name')
  expect(connector).toHaveProperty('displayName')
  expect(connector).toHaveProperty('logoUrl')
  expect(connector).toHaveProperty('stage')
  expect(connector).toHaveProperty('verticals')
  expect(connector).toHaveProperty('supportedModes')
  expect(connector).toHaveProperty('schemas')
})

test('list connector config info', async () => {
  const res = await sdk.GET('/core/connector_config_info')

  expect(res.data).toHaveLength(2)
  // Check we have the default postgres connector
  expect(res.data.find((c) => c.connectorName.includes('plaid'))).toBeTruthy()
  // Check we have the greenhouse connector
  expect(
    res.data.find((c) => c.connectorName.includes('greenhouse')),
  ).toBeTruthy()

  // Check basic properties
  expect(res.data[0]).toHaveProperty('envName')
  expect(res.data[0]).toHaveProperty('displayName')
  expect(res.data[0]).toHaveProperty('connectorName')
  expect(res.data[0]).toHaveProperty('isSource')
  expect(res.data[0]).toHaveProperty('isDestination')
  expect(res.data[0]).toHaveProperty('verticals')
  expect(res.data[0]).toHaveProperty('integrations')
})

test('list configured integrations', async () => {
  const res = await sdk.GET('/configured_integrations')

  expect(res.data.items).toHaveLength(1)
  expect(res.data.items[0]?.connector_name).toEqual('plaid')

  // Check basic properties
  expect(res.data.items[0]).toHaveProperty('connector_config_id')
  expect(res.data.items[0]).toHaveProperty('connector_name')
  expect(res.data.items[0]).toHaveProperty('logo_url')
  expect(res.data.items[0]).toHaveProperty('name')
})

test('create token', async () => {
  const res = await sdk.POST('/connect/token', {
    body: {
      customerId: fixture.org.id,
      validityInSeconds: 600,
    },
  })
  expect(res.data).toHaveProperty('token')
})

test('create connector config with bad parameters fail', async () => {
  await expect(
    sdk.POST('/core/connector_config', {
      body: {
        orgId: fixture.org.id,
        connectorName: 'foo',
        defaultPipeOut: {
          streams: {job: true, candidate: true},
        },
      },
    }),
  ).rejects.toThrow()

  // TODO: this should fail
  // await expect(
  //   sdk.POST('/core/connector_config', {
  //     body: {
  //       orgId: fixture.org.id,
  //       connectorName: 'greenhouse',
  //       defaultPipeOut: {
  //         streams: {michael: true},
  //       },
  //     },
  //   }),
  // ).rejects.toThrow()

  await expect(
    sdk.POST('/core/connector_config', {
      body: {
        orgId: 'micasa',
        connectorName: 'greenhouse',
        defaultPipeOut: {
          streams: {job: true, candidate: true},
        },
      },
    }),
  ).rejects.toThrow()
})

test('Edit organization with bad parameters fails', async () => {
  // TODO ? this should fail ?
  // const org1 = await sdk.PATCH('/viewer/organization', {
  //   body: {
  //     publicMetadata: {
  //       database_url: testDb.url.toString(),
  //       // @ts-expect-error
  //       foo: 'value',
  //     },
  //   },
  // })

  // expect(org1.error).toBeTruthy()

  await expect(
    sdk.PATCH('/viewer/organization', {
      body: {
        publicMetadata: {
          // @ts-expect-error
          database_url: {},
        },
      },
    }),
  ).rejects.toThrow()

  // TODO: this should fail
  // await expect(
  //   sdk.PATCH('/viewer/organization', {
  //     body: {
  //       publicMetadata: {
  //         // @ts-expect-error
  //         migrate_tables: {},
  //       },
  //     },
  //   }),
  // ).rejects.toThrow()

  await expect(
    sdk.PATCH('/viewer/organization', {
      // @ts-expect-error
      body: {},
    }),
  ).rejects.toThrow()
})

test('create connections with bad parameters', async () => {
  // const randomString = (n: number) => {
  //   let str = ''
  //   for (let i = 0; i < n; i++) {
  //     str += 'a'
  //   }
  //   return str
  // }
  const connConfig = await sdk
    .POST('/core/connector_config', {
      body: {
        orgId: fixture.org.id,
        connectorName: 'greenhouse',
      },
    })
    .then((r) => r.data)

  // TODO: validate API keys for greenhouse when adding a connection with it
  // await expect(
  //   sdk.POST('/core/connection', {
  //     body: {
  //       connectorConfigId: connConfig.id,
  //       settings: {apiKey: 'fooApiKey'},
  //     },
  //   }),
  // ).rejects.toThrow()

  await expect(
    sdk.POST('/core/connection', {
      // @ts-expect-error
      body: {},
    }),
  ).rejects.toThrow()

  const body = {
    connectorConfigId: connConfig.id,
    settings: {apiKey: testEnv.conn_greenhouse_API_KEY},
    displayName: 'displayName',
    disabled: false,
    metadata: {
      key: 'value',
    },
  }

  await expect(
    sdk.POST('/core/connection', {
      body: {
        ...body,
        // @ts-expect-error
        settings: 'foo',
      },
    }),
  ).rejects.toThrow()

  // TODO: this should fail
  // await expect(
  //   sdk.POST('/core/connection', {
  //     body: {
  //       ...body,
  //       displayName: randomString(9999),
  //     },
  //   }),
  // ).rejects.toThrow()

  // TODO: this should fail
  // await expect(
  //   sdk.POST('/core/connection', {
  //     body: {
  //       ...body,
  //       // @ts-expect-error
  //       disabled: {},
  //     },
  //   }),
  // ).rejects.toThrow()

  // TODO: this should fail
  // await expect(
  //   sdk.POST('/core/connection', {
  //     body: {
  //       ...body,
  //       metadata: 'foo',
  //     },
  //   }),
  // ).rejects.toThrow()

  // TODO: this should fail
  // await expect(
  //   sdk.POST('/core/connection', {
  //     body: {
  //       ...body,
  //       customerId: randomString(999),
  //     },
  //   }),
  // ).rejects.toThrow()

  await expect(
    sdk.POST('/core/connection', {
      body: {
        ...body,
        integrationId: 'foo',
      },
    }),
  ).rejects.toThrow()
})

// Group: /health
describe('/health', () => {
  test('GET /health - Health check', async () => {
    const res = await sdk.GET('/health')
    expect(res.response.status).toEqual(200)
    expect(res.data).toMatchObject({healthy: true})
  })

  // TODO: fix this, failing with
  //       "message": "unrecognized configuration parameter \"schema\"",
  // test('GET /health?exp=true - Health check with query params', async () => {
  //   const res = await sdk.GET('/health', {
  //     params: {
  //       query: {exp: true},
  //     },
  //   })
  //   expect(res.response.status).toEqual(200)
  //   expect(res.data.healthy).toBe(true)
  // })
})

// Group: /clerk-testing-token
describe('/clerk-testing-token', () => {
  test('GET /clerk-testing-token - Returns a testing token', async () => {
    const res = await sdk.GET('/clerk-testing-token', {
      params: {
        query: {secret: testEnv.INTEGRATION_TEST_SECRET + ''},
      },
    })
    expect(res.response.status).toEqual(200)
    expect(res.data).toHaveProperty('testing_token')
  })
})

// Group: /connect
describe('/connect', () => {
  test('POST /connect/token - Creates a connect token', async () => {
    const res = await sdk.POST('/connect/token', {
      body: {
        customerId: 'testCustomer',
        validityInSeconds: 600,
      },
    })
    expect(res.response.status).toEqual(200)
    expect(res.data).toHaveProperty('token')
  })

  test('POST /connect/magic-link - Creates a magic link', async () => {
    const res = await sdk.POST('/connect/magic-link', {
      body: {
        customerId: 'testCustomer',
        displayName: 'Test',
        redirectUrl: 'https://example.com',
      },
    })
    expect(res.response.status).toEqual(200)
    expect(res.data).toHaveProperty('url')
  })
})

// Group: /passthrough
describe('/passthrough', () => {
  // TODO: add passthrough positive case

  test('POST /passthrough - Throws error for greenhouse passthrough request', async () => {
    const connConfig = await sdk
      .POST('/core/connector_config', {
        body: {
          orgId: fixture.org.id,
          connectorName: 'greenhouse',
        },
      })
      .then((r) => r.data)

    // TODO: validate API keys for greenhouse when adding a connection with it
    const {data: connId} = await sdk.POST('/core/connection', {
      body: {
        connectorConfigId: connConfig.id,
        settings: {apiKey: 'fooApiKey'},
      },
    })

    await expect(async () => {
      await sdk.POST('/passthrough', {
        body: {
          method: 'GET',
          path: 'https://jsonplaceholder.typicode.com/todos/1',
        },
        headers: {
          'x-connection-id': connId,
        },
      })
    }).rejects.toThrow()
  })
})
