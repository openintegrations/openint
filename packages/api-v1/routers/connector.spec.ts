import type {Viewer} from '@openint/cdk'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../trpc/context'
import {onError} from '../trpc/error-handling'
import {connectorRouter} from './connector'

const logger = false

jest.setTimeout(1000 * 60 * 15)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCaller(viewer: Viewer) {
    return connectorRouter.createCaller(routerContextFromViewer({db, viewer}), {
      onError,
    })
  }

  const asOrg = getCaller({role: 'org', orgId: 'org_222'})

  test('list connectors', async () => {
    const res = await asOrg.listConnectors()

    expect(res.items.length).toBeGreaterThan(1)
  })

  test('list connectors with schemas', async () => {
    const res = await asOrg.listConnectors({expand: ['schemas']})
    expect(
      res.items.sort((a, b) => a.name.localeCompare(b.name)),
    ).toMatchSnapshot()
  })

  test('get connector by with invalid name returns error', async () => {
    await expect(
      asOrg.getConnectorByName({name: 'foo' as never}),
    ).rejects.toThrow(/Input validation failed/)
  })

  test('get connector by name', async () => {
    const res = await asOrg.getConnectorByName({
      name: 'google-drive',
      expand: ['schemas'],
    })

    expect(res).toMatchObject({
      name: 'google-drive',
      display_name: 'Google Drive',
      logo_url: expect.any(String),
      schemas: {
        connector_config: expect.any(Object),
        connection_settings: expect.any(Object),
        connect_input: expect.any(Object),
        connect_output: expect.any(Object),
      },
    })
  })
})
