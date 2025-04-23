import * as Sentry from '@sentry/nextjs'
import {posthog} from 'posthog-js'
import {zUserId} from '@openint/cdk'
import {zEvent} from '@openint/events/events'
import {zUserTraits} from '@openint/events/events.def'
import {z} from '@openint/util/zod-utils'

export const browserAnalytics = {
  identify: z
    .function()
    .args(zUserId, zUserTraits.optional())
    .implement((userId, traits) => {
      posthog.identify(userId, traits)
      Sentry.setUser({id: userId, email: traits?.email})
    }),
  track: z
    .function()
    .args(zEvent)
    .implement((event) => {
      posthog.capture(event.name, event.data)
    }),
  reset: () => {
    return posthog.reset()
  },
}
;(globalThis as any).posthog = posthog
;(globalThis as any).browserAnalytics = browserAnalytics
