import type {Viewer} from '@openint/cdk'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../trpc/context'
import {connectorRouter} from './connector'

const logger = false

jest.setTimeout(1000 * 60 * 15)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCaller(viewer: Viewer) {
    return connectorRouter.createCaller(routerContextFromViewer({db, viewer}))
  }

  const asOrg = getCaller({role: 'org', orgId: 'org_222'})

  test('list connectors', async () => {
    const res = await asOrg.listConnectors()
    expect(res.length).toBeGreaterThan(1)
  })

  test('list connectors with integrations', async () => {
    const res = await asOrg.listConnectors({expand: ['integrations']})
    const mergeIndex = res.findIndex((c) => c.name === 'merge')

    expect(res[mergeIndex]?.integrations?.length).toBeGreaterThan(1)
  })

  test('get schema by with invalid name returns error', async () => {
    await expect(asOrg.getSchemaByName({name: 'foo'})).rejects.toThrow(
      /Invalid enum value/,
    )
  })

  test('get schema by name', async () => {
    const res = await asOrg.getSchemaByName({name: 'google'})

    expect(res).toMatchObject({
      name: {type: 'string', const: 'google'},
      connectorConfig: {
        type: 'object',
        properties: {
          oauth: {
            properties: {
              client_id: {type: 'string'},
              client_secret: {type: 'string'},
              scopes: {
                description: 'global google connector space separated scopes',
                type: 'string',
              },
            },
          },
          integrations: {
            properties: {
              calendar: expect.any(Object),
              docs: expect.any(Object),
              drive: expect.any(Object),
              gmail: expect.any(Object),
              sheets: expect.any(Object),
              slides: expect.any(Object),
            },
          },
        },
        required: ['oauth', 'integrations'],
      },
      connectionSettings: {
        type: 'object',
        properties: {
          oauth: expect.any(Object),
          error: expect.any(Object),
          client_id: {type: 'string'},
        },
        required: ['oauth'],
        components: {
          schemas: {
            AuthMode: {
              enum: ['OAUTH2', 'OAUTH1', 'BASIC', 'API_KEY'],
              type: 'string',
            },
          },
        },
      },
      connectOutput: {
        type: 'object',
        properties: {
          providerConfigKey: {
            type: 'string',
            description: "Must start with 'ccfg_'",
          },
          connectionId: {
            description: "Must start with 'conn_'",
            type: 'string',
          },
        },
        required: ['providerConfigKey', 'connectionId'],
      },
    })
  })
})
