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

    expect(res).toHaveLength(49)
    expect(res[0]?.name).toEqual('aircall')
    expect(res[0]?.displayName).toEqual('Aircall')
    // TODO: Use the same logic for logoUrl as we do in connectorConfig
    expect(res[0]?.logoUrl).toEqual('/_assets/logo-aircall.svg')
    expect(res[0]?.stage).toEqual('beta')
  })

  test('list connectors with integrations', async () => {
    const res = await asOrg.listConnectors({expand: ['integrations']})
    const mergeIndex = res.findIndex((c) => c.name === 'merge')

    expect(res[mergeIndex]?.name).toEqual('merge')
    expect(res[mergeIndex]?.logoUrl).toEqual('/_assets/logo-merge.svg')
    expect(res[mergeIndex]?.stage).toEqual('beta')
    expect(res[mergeIndex]?.integrations?.length).toBeGreaterThan(215)
  })
})
