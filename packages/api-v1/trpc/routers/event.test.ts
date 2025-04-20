import type {CustomerId, Viewer} from '@openint/cdk'

import {eq, schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {$test} from '@openint/util/__tests__/test-utils'
import {trpc} from '../_base'
import {routerContextFromViewer} from '../context'
import {onError} from '../error-handling'
import {eventRouter} from './event'

const logger = true

const router = trpc.mergeRouters(eventRouter)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  /** Preferred approach */
  function getCaller(viewer: Viewer) {
    return router.createCaller(routerContextFromViewer({db, viewer}), {onError})
  }

  const viewers = [
    {role: 'org', orgId: 'org_222'},
    {role: 'user', userId: 'user_222', orgId: 'org_222'},
    {role: 'customer', orgId: 'org_222', customerId: 'cus_222' as CustomerId},
    {role: 'user', userId: 'user_333', orgId: 'org_other'},
  ] satisfies Viewer[]

  describe.each(viewers)('viewer: $role $userId', (viewer) => {
    const caller = getCaller(viewer)

    const eventRes = $test('create event', async () => {
      const res = await caller.createEvent({
        event: {
          name: 'debug.debug',
          data: {},
        },
      })

      return res
    })

    $test('list events', async () => {
      const res = await caller.listEvents()

      expect(res.items).toHaveLength(1)
      expect(res.items[0]?.id).toBe(eventRes.current?.id)
    })

    afterAll(async () => {
      if (eventRes.current?.id) {
        await db
          .delete(schema.event)
          .where(eq(schema.event.id, eventRes.current?.id))
      }
    })
  })
})
