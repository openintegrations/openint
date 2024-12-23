// /* eslint-disable jest/no-standalone-expect */
import type {CustomerId, EntityPayloadWithRaw, SyncOperation} from '@openint/cdk'
import {rxjs, toCompletion} from '@openint/util'
import twentyServer from './server'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const accessToken = process.env['TWENTY_ACCESS_TOKEN']!
const maybeTest = accessToken ? test : test.skip

maybeTest('destinationSync', async () => {
  const destLink = twentyServer.destinationSync({
    config: {},
    customer: {id: 'esur_12' as CustomerId, orgId: 'org_123'},
    settings: {access_token: accessToken},
    source: {id: 'conn_123', connectorName: 'salesforce'},
    state: {},
  })
  const src = rxjs.from([
    {
      data: {
        id: '123',
        connectorName: 'salesforce',
        entity: {
          name: 'sfdc',
        },
        entityName: 'company',
        connection_id: 'conn_123',
      },
      type: 'data',
    } satisfies SyncOperation<EntityPayloadWithRaw>,
  ])

  await toCompletion(destLink(src))
})
