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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
    return new Promise(async (resolve) => {
      // after(async () => {
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
          console.log(
            'Webhook result',
            webhookResult,
            await webhookResult.text(),
          )
        }
      }
      resolve()
      // })
    })
  },
} satisfies Dispatcher
