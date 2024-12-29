import {EventSchemas, Inngest, InngestMiddleware} from 'inngest'
import {makeId} from '@openint/cdk'
import {db, schema, sql} from '@openint/db'
import {makeUlid, R} from '@openint/util'
import {eventMapForInngest} from './events'

export const persistEventsMiddleware = new InngestMiddleware({
  name: 'Persist Events Inngest Middleware',
  init: () => {
    type EventForInsert = (typeof schema)['event']['$inferInsert']
    let pendingEvents: EventForInsert[] = []

    return {
      onSendEvent() {
        return {
          async transformInput({payloads}) {
            function getConnIdForEvent(ev: {data?: Record<string, unknown>}) {
              // TODO: QQ, how to best cleanup this?
              return (ev.data?.['connectionId'] ??
                ev.data?.['connection_id'] ??
                ev.data?.['sourceId'] ??
                ev.data?.['source_id'] ??
                ev.data?.['destinationId'] ??
                ev.data?.['destination_id']) as string | undefined
            }
            const connectionIds = R.uniq(
              payloads.map(getConnIdForEvent).filter((id) => !!id),
            )

            const rows = await db.execute<{
              id: string
              org_id: string
              customer_id: string
            }>(sql`
              SELECT c.id, cc.org_id, c.customer_id as cus_id
              FROM ${schema.connection} c
              JOIN ${schema.connector_config} cc ON c.connector_config_id = cc.id
              WHERE c.id = ANY(${connectionIds})
            `)

            const infoByConnId = Object.fromEntries(
              rows.map(({id, ...info}) => [id, info]),
            )
            const events = payloads.map((payload) => ({
              ...payload,
              id: makeId('evt', makeUlid()),
              data: (payload.data as undefined | {}) ?? {},
              user: {
                ...infoByConnId[getConnIdForEvent(payload) ?? ''],
                ...(payload.user as {} | undefined),
              },
            }))
            pendingEvents = events
            return {payloads: events}
          },
          async transformOutput() {
            await db.insert(schema.event).values(pendingEvents)
            pendingEvents = []
          },
        }
      },
    }
  },
})

export const inngest = new Inngest({
  id: 'OpenInt',
  schemas: new EventSchemas().fromZod(eventMapForInngest),
  // TODO: have a dedicated browser inngest key
  eventKey: process.env['INNGEST_EVENT_KEY'] ?? 'local',
  // This is needed in the browser otherwise we get failed to execute fetch on Window
  // due to the way Inngest uses this.fetch when invoking fetch
  fetch: globalThis.fetch.bind(globalThis),
  middleware: [persistEventsMiddleware],
})