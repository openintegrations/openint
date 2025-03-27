import type {CustomerId, Viewer} from '@openint/cdk'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {getTestTRPCClient} from '../__tests__/test-utils'
import {routerContextFromViewer} from '../trpc/context'
import {connectorConfigRouter} from './connectorConfig'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  /** Preferred approach */
  function getCaller(viewer: Viewer) {
    return connectorConfigRouter.createCaller(
      routerContextFromViewer({db, viewer}),
    )
  }
  /** Also possible */
  function getClient(viewer: Viewer) {
    return getTestTRPCClient({db, router: connectorConfigRouter}, viewer)
  }
  const asOrg = getCaller({role: 'org', orgId: 'org_222'})
  const asUser = getCaller({
    role: 'user',
    userId: 'user_222',
    orgId: 'org_222',
  })
  const asCustomer = getCaller({
    role: 'customer',
    orgId: 'org_222',
    customerId: 'cus_222' as CustomerId,
  })
  const asOtherUser = getCaller({
    role: 'user',
    userId: 'user_333',
    orgId: 'org_other',
  })

  // Tests linearly depend on each other for performance and simplicty

  test('create connector config', async () => {
    const res = await asOrg.createConnectorConfig({
      connector_name: 'qbo',
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        envName: 'sandbox',
      },
    })
    expect(res).toEqual({
      id: expect.any(String),
      org_id: 'org_222',
      connector_name: 'qbo',
      created_at: expect.any(String),
      updated_at: expect.any(String),
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        envName: 'sandbox',
      },
    })
  })

  test('list connector config', async () => {
    const res = await asOrg.listConnectorConfigs()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
    expect(res.total).toEqual(1)
  })

  test('list connector config via custom client', async () => {
    const res = await getClient({
      role: 'org',
      orgId: 'org_222',
    }).listConnectorConfigs.query()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
  })

  test('user has access to org connector config', async () => {
    const res = await asUser.listConnectorConfigs()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
  })

  test('customer does not have access to org connector config', async () => {
    await expect(asCustomer.listConnectorConfigs()).rejects.toThrow(
      'permission denied',
    )
  })

  test('other user does not have access to org connector config', async () => {
    const res = await asOtherUser.listConnectorConfigs()
    expect(res.items).toHaveLength(0)
  })

  test('connector config create with integrations', async () => {
    const res = await asOrg.createConnectorConfig({
      connector_name: 'google',
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        integrations: {
          drive: {
            enabled: true,
            scopes: 'https://www.googleapis.com/auth/drive',
          },
          gmail: {
            enabled: false,
            scopes: 'https://www.googleapis.com/auth/gmail',
          },
        },
      },
    })

    expect(res).toEqual({
      id: expect.any(String),
      org_id: 'org_222',
      connector_name: 'google',
      created_at: expect.any(String),
      updated_at: expect.any(String),
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        integrations: {
          drive: {
            enabled: true,
            scopes: 'https://www.googleapis.com/auth/drive',
          },
          gmail: {
            enabled: false,
            scopes: 'https://www.googleapis.com/auth/gmail',
          },
        },
      },
    })
  })

  test('list connector config with expand enabled_integrations', async () => {
    const res = await getClient({
      role: 'org',
      orgId: 'org_222',
    }).listConnectorConfigs.query({
      expand: 'enabled_integrations',
    })
    expect(res.items).toHaveLength(2)

    // Find the Google connector
    const googleConnector = res.items.find(
      (item) => item.connector_name === 'google',
    )

    expect(googleConnector?.integrations).toEqual({
      drive: {
        enabled: true,
        scopes: 'https://www.googleapis.com/auth/drive',
      },
    })
  })

  test('list connector config with expand connection_count', async () => {
    const res = await getClient({
      role: 'org',
      orgId: 'org_222',
    }).listConnectorConfigs.query({
      expand: 'connection_count',
    })
    expect(res.items).toHaveLength(2)

    expect(res.items[0]?.connection_count).toEqual(0)
    expect(res.items[1]?.connection_count).toEqual(0)
  })

  test('list connector config with expand connector and enabled_integrations', async () => {
    const res = await getClient({
      role: 'org',
      orgId: 'org_222',
    }).listConnectorConfigs.query({
      expand: 'connector,enabled_integrations',
    })

    const googleConnector = res.items.find(
      (item) => item['connector_name'] === 'google',
    )

    expect(googleConnector?.integrations).toBeDefined()
    expect(googleConnector?.connector).toBeDefined()
  })

  test('update connector config', async () => {
    const createRes = await asOrg.createConnectorConfig({
      connector_name: 'qbo',
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        envName: 'sandbox',
      },
    })

    const updateRes = await asOrg.updateConnectorConfig({
      id: createRes.id,
      config: {
        oauth: {client_id: 'client_333', client_secret: 'yyy'},
        envName: 'production',
      },
    })

    expect(updateRes.config).toEqual({
      oauth: {client_id: 'client_333', client_secret: 'yyy'},
      envName: 'production',
    })
    expect(updateRes.updated_at).not.toEqual(createRes.updated_at)
  })

  test('update connector config with invalid id returns error', async () => {
    await expect(
      asOrg.updateConnectorConfig({
        id: 'ccfg_invalid',
        config: {
          oauth: {client_id: 'client_333', client_secret: 'yyy'},
          envName: 'production',
        },
      }),
    ).rejects.toThrow('not found')
  })

  test('delete connector config', async () => {
    const createRes = await asOrg.createConnectorConfig({
      connector_name: 'qbo',
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        envName: 'sandbox',
      },
    })

    const id = createRes.id

    const res = await asOrg.deleteConnectorConfig({
      id,
    })
    expect(res).toBeDefined()
    expect(res.connector_name).toEqual('qbo')
  })

  test('delete connector with invalid id returns error', async () => {
    await expect(
      asOrg.deleteConnectorConfig({
        id: 'ccfg_invalid',
      }),
    ).rejects.toThrow('not found')
  })
})
