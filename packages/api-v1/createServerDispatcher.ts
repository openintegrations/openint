import type {after as afterFn} from 'next/server'
import type {Viewer} from '@openint/cdk'
import type {AnyDrizzle} from '@openint/db/db'
import type {Event} from '@openint/events/events'

import fetchRetry from 'fetch-retry'
import {makeId} from '@openint/cdk'
import {eq, schema} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'

export function createServerDispatcher({
  db,
  after,
}: {
  db: AnyDrizzle
  after?: typeof afterFn
  // Add fetch as a parameter
}) {
  const fetchWithRetry = fetchRetry(fetch)

  const dispatcher = {
    async dispatch(event: Event, viewer: Viewer) {
      const [evt] = await db
        .insert(schema.event)
        .values({
          id: makeId('evt', makeUlid()),
          name: event.name,
          data: event.data,
          user: viewer,
        })
        .returning()
      console.log('Event inserted', evt)

      async function sendWebhook() {
        if (!viewer?.orgId) {
          return
        }
        const org = await db.query.organization.findFirst({
          where: eq(schema.organization.id, viewer.orgId),
        })
        if (org?.metadata?.webhook_url) {
          console.log('Sending webhook', org.metadata.webhook_url)
          // TODO: Use ofetch to add retry logic
          // TODO: Add webhook result to event for debugging purpose
          // thought perhaps we could have done this with a retryLink?!
          const webhookResult = await fetchWithRetry(org.metadata.webhook_url, {
            method: 'POST',
            body: JSON.stringify(evt),
            retries: 5,
            retryDelay(attempt) {
              return Math.pow(2, attempt) * 1000 // 1000, 2000, 4000, 8000, 16000, 32000
            },
          })
          console.log(
            'Webhook result',
            webhookResult,
            await webhookResult.text(),
          )
        }
      }

      const webhookPromise = sendWebhook()
      if (after) {
        console.log('await webhook after')
        // This will trigger immediately but will wait until after the request is complete to await on the task
        // Alternatively we can do the actual work in the `after` callback but then in situations like react server component SSE
        // the work won't start for many seconds until the entire request has completed which is not ideal
        after(webhookPromise)
      } else {
        console.log('await webhook now')
        await webhookPromise
      }
      return evt!
    },
  }

  return dispatcher
}
