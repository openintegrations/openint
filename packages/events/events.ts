import type {NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import type {Combine, EventSchemas, EventsFromOpts} from 'inngest'
import type {ZodToStandardSchema} from 'inngest/components/EventSchemas'
import {R} from '@openint/util/remeda'
import {z} from '@openint/util/zod-utils'
import {eventMap} from './events.def'

type BuiltInEvents = EventsFromOpts<{schemas: EventSchemas; id: never}>

export const eventMapForInngest = R.mapValues(eventMap, (v) => ({
  data: z.object(v),
})) as unknown as {
  [k in keyof typeof eventMap]: {
    data: Z.ZodObject<(typeof eventMap)[k]>
  }
}

export const outgoingWebhookEventMap = R.pickBy(eventMapForInngest, (_, name) =>
  ['connect.connection-connected', 'sync.completed'].includes(name),
)

export type Events = Combine<
  BuiltInEvents,
  ZodToStandardSchema<typeof eventMapForInngest>
>

// MARK: - Deprecated

export const zEvent = z.discriminatedUnion(
  'name',
  Object.entries(eventMap).map(([name, props]) =>
    z.object({name: z.literal(name), data: z.object(props)}),
  ) as unknown as NonEmptyArray<
    {
      [k in keyof typeof eventMap]: Z.ZodObject<{
        name: Z.ZodLiteral<k>
        data: Z.ZodObject<(typeof eventMap)[k]>
      }>
    }[keyof typeof eventMap]
  >,
)

export type Event = Z.infer<typeof zEvent>
