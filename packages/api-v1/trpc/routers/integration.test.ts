import type {Viewer} from '@openint/cdk'

import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../context'
import {onError} from '../error-handling'
import {integrationRouter} from './integration'

const logger = false

jest.setTimeout(1000 * 60 * 15)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCaller(viewer: Viewer) {
    return integrationRouter.createCaller(
      routerContextFromViewer({db, viewer}),
      {onError},
    )
  }

  const anon = getCaller({role: 'anon'})

  test('list oauth integrations', async () => {
     const res = await anon.listConnectorIntegrations({name: 'google-drive'})

    expect(res.items.length).toEqual(1)
    expect(res.items[0]?.id).toEqual('int_google-drive')
    expect(res.items[0]?.name).toEqual('Google Drive')
    expect(res.items[0]?.logo_url).toContain('google-drive')
  })
})
