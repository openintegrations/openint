'use client'

import {useEffect, useRef} from 'react'
import {ZRaw, zViewerFromUnverifiedJwtToken} from '@openint/cdk'
import {_trpcReact} from '@openint/engine-frontend'

declare global {
  interface Window {
    onOpenIntEvent?: (event: any) => void
  }
}
export function EventPoller({accessToken}: {accessToken?: string | null}) {
  const viewer = zViewerFromUnverifiedJwtToken.parse(accessToken)
  const customerId = viewer.role === 'customer' ? viewer.customerId : null

  // Track the latest event ID we've seen
  const lastEventIdRef = useRef<number>(Date.now())

  // Only query if we have a callback and customerId
  const enabled = Boolean(window.onOpenIntEvent && customerId)

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

  // Send new events to parent iframe
  useEffect(() => {
    if (!data?.items?.length || !window.onOpenIntEvent) return

    // Update last seen event ID
    const latestEvent = data.items[data.items.length - 1]
    if (
      latestEvent &&
      new Date(latestEvent?.createdAt).getTime() > lastEventIdRef.current
    ) {
      lastEventIdRef.current = new Date(latestEvent?.createdAt).getTime()

      // Send each new event to the callback
      data.items.forEach((event: ZRaw['event']) => {
        window.onOpenIntEvent?.(event)
      })
    }
  }, [data])

  return null
}
