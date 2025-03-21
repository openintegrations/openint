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

    expect(res.items.length).toBeGreaterThan(1)
  })

  test('list connectors with integrations', async () => {
    const res = await asOrg.listConnectors({
      expand: ['integrations'],
      limit: 100,
    })
    const mergeIndex = res.items.findIndex((c) => c.name === 'merge')

    expect(res.items[mergeIndex]?.integrations?.length).toBeGreaterThan(1)
  })

  test('get connector by with invalid name returns error', async () => {
    await expect(asOrg.getConnectorByName({name: 'foo'})).rejects.toThrow(
      /Invalid enum value/,
    )
  })

  test('get connector by name', async () => {
    const res = await asOrg.getConnectorByName({name: 'googledrive'})

    expect(res).toMatchObject({
      name: 'googledrive',
      display_name: 'Google Drive',
      logo_url: expect.any(String),
      schemas: {
        connector_config: expect.any(Object),
        connection_settings: expect.any(Object),
        pre_connect_input: expect.any(Object),
        connect_input: expect.any(Object),
        connect_output: expect.any(Object),
      },
    })
  })
})
