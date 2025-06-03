import type {CustomerId, Viewer} from '@openint/cdk'

// Jest and mocking imports/setup
import {jest} from '@jest/globals'
import {eq, schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {$test} from '@openint/util/__tests__/test-utils'
import {trpc} from '../_base'
import {routerContextFromViewer} from '../context'
import {onError} from '../error-handling'
import {eventRouter} from './event'

jest.mock('@openint/env', () => {
  const actualEnv = jest.requireActual('@openint/env') as {
    envRequired: Record<string, string> | undefined
  }
  return {
    ...actualEnv,
    envRequired: {
      ...(actualEnv.envRequired ?? {}),
      AI_ROUTER_URL: 'http://mock-ai-router.com',
    },
  }
})

jest.mock('./connector.models', () => {
  const actualConnectorModels = jest.requireActual(
    './connector.models',
  ) as Record<string, unknown>
  return {
    ...actualConnectorModels,
    getConnectorModelByName: jest.fn(),
  }
})

const logger = true

const router = trpc.mergeRouters(eventRouter)

describeEachDatabase(
  {drivers: ['pglite'], migrate: true, logger},
  (db, index) => {
    /** Preferred approach */
    function getCaller(viewer: Viewer) {
      return router.createCaller(routerContextFromViewer({db, viewer}), {
        onError,
      })
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

      test('list events with search query', async () => {
        const res = await caller.listEvents({
          search_query: 'evt',
        })
        expect(res.items).toHaveLength(1)
      })

      test('list events with non-existent search query', async () => {
        const res = await caller.listEvents({
          search_query: 'test',
        })
        expect(res.items).toHaveLength(0)
      })

      test('list events with since parameter', async () => {
        const now = new Date().toISOString()
        const noSinceList = await caller.listEvents()

        expect(noSinceList.items).toHaveLength(1)

        const initialList = await caller.listEvents({
          since: now,
        })

        expect(initialList.items).toHaveLength(0)

        // Wait a bit to ensure the timestamps are different
        await new Promise((resolve) => setTimeout(resolve, 10))

        // Create a third event after the 'now' timestamp
        const newEvent = await caller.createEvent({
          event: {
            name: 'debug.debug',
            data: {message: 'new event after since'},
          },
        })

        const res = await caller.listEvents({
          since: now,
        })

        expect(res.items).toHaveLength(1)
        expect(res.items[0]?.id).toBe(newEvent.id)
      })

      afterAll(async () => {
        // This existing afterAll deletes all events from the 'event' table if eventRes.current was set.
        // It's broad enough to clean up the connectionEvent created in the prompt test.
        // If eventRes.current?.id is not guaranteed, a more direct db.delete(schema.event) might be better.
        // For now, we assume this is sufficient.
        if (eventRes.current?.id) {
          await db.delete(schema.event)
        } else {
          // Fallback cleanup if the primary event wasn't created, ensures a clean state.
          // This might be needed if $test('create event',...) fails for some viewer roles.
          await db
            .delete(schema.event)
            .where(eq(schema.event.org_id, viewer.orgId))
        }
      })
    })
  },
)
