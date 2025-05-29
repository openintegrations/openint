import Openint from '@openint/sdk'
import {ListEventsResponse} from '@openint/sdk/resources/top-level'
import {ConnectProps} from './common'

export const createClientOnlyEventId = (): string => {
  return `evt_CLIENTONLY_${Math.random().toString(36).substring(2, 15)}`
}

export type OpenIntEvent = ListEventsResponse

export const listenToEvents = (
  props: ConnectProps,
  callback: (event: OpenIntEvent) => void,
): (() => void) => {
  if (typeof window === 'undefined') {
    console.warn(
      '[OpenInt Connect] listenToEvents called in a non-browser environment. Polling will not start.',
    )
    return () => {}
  }

  // the base URL passed in the SDK is the same one, even though its used to load
  // the connect domain and API. listEvents needs the API URL, not the connect domain.
  // for now this is a temporary fix that works for our local development as per the default .env but we should move to a better solution
  // potentially with an apiBaseURL and connectBaseURL as separate props
  let baseURL = props.baseURL
  if (baseURL && baseURL.endsWith('/connect')) {
    baseURL = baseURL.slice(0, -8) + '/api/v1'
  }
  const client = new Openint({token: props.token, baseURL})

  let lastEventTimestamp = new Date()
  let pollingIntervalId: number | undefined = undefined
  let isActive = true
  let errorCount = 0
  const MAX_ERRORS = 3
  const POLLING_INTERVAL_MS = 1000
  const EVENT_LIMIT_PER_POLL = 50

  const pollEvents = async () => {
    const newEvents: OpenIntEvent[] = []
    if (!isActive) {
      return
    }

    try {
      const {items: sdkEvents} = await client.listEvents({
        limit: EVENT_LIMIT_PER_POLL,
        since: lastEventTimestamp.toISOString(),
      })

      errorCount = 0

      for (const sdkEvent of sdkEvents) {
        if (!sdkEvent.timestamp) {
          continue
        }
        if (new Date(sdkEvent.timestamp) > lastEventTimestamp) {
          newEvents.push(sdkEvent) // Pass SDK event as is
        }
      }

      if (newEvents.length > 0) {
        // sort events by timestamp ascending just in case backend changes default sorting
        newEvents.sort(
          (a, b) =>
            new Date(a?.timestamp ?? '').getTime() -
            new Date(b?.timestamp ?? '').getTime(),
        )
        let maxTsInBatch = lastEventTimestamp
        for (const eventToCallback of newEvents) {
          // console.log('eventToCallback', eventToCallback)
          callback(eventToCallback) // Successful SDK event
          if (
            eventToCallback.timestamp &&
            new Date(eventToCallback.timestamp) > maxTsInBatch
          ) {
            maxTsInBatch = new Date(
              // add 1 second to the timestamp to avoid duplicating events with the backend GTE comparison
              new Date(eventToCallback.timestamp).getTime() + 1000,
            )
          }
        }
        if (maxTsInBatch > lastEventTimestamp) {
          lastEventTimestamp = maxTsInBatch
        }
      }
    } catch (error) {
      console.error(
        '[OpenInt Connect] Error polling for events via SDK:',
        error,
      )
      errorCount++

      if (errorCount === MAX_ERRORS) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown polling events error via SDK'

        const pollingFailedEvent: OpenIntEvent = {
          name: 'connect.loading-error',
          id: createClientOnlyEventId(),
          timestamp: new Date().toISOString(),
          data: {
            error_message: `Events polling failed after ${errorCount} attempts`,
            error_details: errorMessage as any, // TODO: remove this when types are updated in BE to be string|undefined
          },
        }
        callback(pollingFailedEvent)
        isActive = false
        if (pollingIntervalId !== undefined) {
          window.clearInterval(pollingIntervalId)
        }
      }
    }
  }

  setTimeout(pollEvents, 0)

  pollingIntervalId = window.setInterval(pollEvents, POLLING_INTERVAL_MS)

  return () => {
    isActive = false
    if (pollingIntervalId !== undefined) {
      window.clearInterval(pollingIntervalId)
    }
  }
}
