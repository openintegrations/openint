import {Viewer} from '@openint/cdk'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../context'
import {connectorRouter} from './connector'

const logger = false

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
})
