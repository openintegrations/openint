'use client'

import {useEffect, useRef} from 'react'
import {zViewerFromUnverifiedJwtToken} from '@openint/cdk'
import {_trpcReact} from '@openint/engine-frontend'

export function EventPoller({accessToken}: {accessToken?: string | null}) {
  const viewer = zViewerFromUnverifiedJwtToken.parse(accessToken)
  const customerId = viewer.role === 'customer' ? viewer.customerId : null

  // Track if polling should be active and store message source
  const isListeningRef = useRef(false)
  const messageSourceRef = useRef<Window | null>(null)

  // Track the latest event ID we've seen
  const lastEventIdRef = useRef<number>(Date.now())

  // Listen for messages from parent window or current window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our parent or ourselves
      if (event.source !== window.parent && event.source !== window) return

      if (event.data === 'openIntListen') {
        isListeningRef.current = true
        messageSourceRef.current = event.source as Window
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Only query if we're listening and have a customerId
  const enabled = Boolean(isListeningRef.current && customerId)

  const {data} = _trpcReact.listEvents.useQuery(
    {
      since: lastEventIdRef.current,
      customerId,
      page_size: 100,
    },
    {
      enabled,
      refetchInterval: 1000, // Poll every second
    },
  )

  // Send new events back to the source that requested them
  useEffect(() => {
    if (
      !data?.items?.length ||
      !isListeningRef.current ||
      !messageSourceRef.current
    )
      return

    // Update last seen event ID
    const latestEvent = data.items[data.items.length - 1]
    if (
      latestEvent &&
      new Date(latestEvent?.timestamp).getTime() > lastEventIdRef.current
    ) {
      lastEventIdRef.current = new Date(latestEvent?.timestamp).getTime()

      // Send each new event back to the source that requested them
      data.items.forEach((event) => {
        messageSourceRef.current?.postMessage(
          {
            type: 'openIntEvent',
            event,
          },
          '*',
        )
      })
    }
  }, [data])

  return null
}
