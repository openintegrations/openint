import type {Dispatcher} from '@openint/events/dispatch'

import {after} from 'next/server'
import {makeId} from '@openint/cdk'
import {eq, schema} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import {db} from './globals'

/**
 * awaiting on this promise during the middle of thr equest would be a problema as
 * it would be self-referencing and therefore never resolve
 */
export const serverDispatcher = {
  async dispatch(event, viewer) {
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
    if (viewer?.orgId) {
      const org = await db.query.organization.findFirst({
        where: eq(schema.organization.id, viewer.orgId),
      })
      if (org?.metadata?.webhook_url) {
        console.log('Sending webhook', org.metadata.webhook_url)
        // TODO: Use ofetch to add retry logic
        // TODO: Add webhook result to event for debugging purpose
        const webhookResult = await fetch(org.metadata.webhook_url, {
          method: 'POST',
          body: JSON.stringify(evt),
        })
        console.log('Webhook result', webhookResult, await webhookResult.text())
      }
    }
  },
} satisfies Dispatcher

export const serverAfterDispatch = {
  dispatch(event, viewer) {
    console.log('After dispatch', event, viewer)
    // This will trigger immediately but will wait until after the request is complete to await on the task
    // Alternatively we can do the actual work in the `after` callback but then in situations like react server component SSE
    // the work won't start for many seconds until the entire request has completed which is not ideal
    const task = serverDispatcher.dispatch(event, viewer)
    after(task)
    return task

    // return new Promise((resolve, reject) => {
    //   const task = serverDispatcher
    //     .dispatch(event, viewer)
    //     .then(resolve)
    //     .catch(reject)
    //   after(task)
    // })
  },
} satisfies Dispatcher
