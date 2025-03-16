import {Viewer} from '@openint/cdk'
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
      /Invalid connector name/,
    )
  })

  // TODO: @rodri77 - Add a positive test for getting the schema by name
})
