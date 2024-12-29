'use client'

import {useEffect, useRef, useState} from 'react'
import {zViewerFromUnverifiedJwtToken} from '@openint/cdk'
import {_trpcReact} from '@openint/engine-frontend'

declare global {
  interface Window {
    onOpenIntEvent?: (event: any) => void
  }
}

export function EventPoller({accessToken}: {accessToken?: string | null}) {
  const viewer = zViewerFromUnverifiedJwtToken.parse(accessToken)
  const customerId = viewer.role === 'customer' ? viewer.customerId : null

  // Track if callback is set
  const [hasCallback, setHasCallback] = useState(Boolean(window.onOpenIntEvent))

  // Track the latest event ID we've seen
  const lastEventIdRef = useRef<number>(Date.now())

  // Watch for changes to window.onOpenIntEvent using property descriptor
  useEffect(() => {
    let originalCallback = window.onOpenIntEvent

    Object.defineProperty(window, 'onOpenIntEvent', {
      configurable: true,
      get: () => originalCallback,
      set: (newCallback) => {
        originalCallback = newCallback
        setHasCallback(Boolean(newCallback))
      },
    })

    // Check immediately in case it was set before
    setHasCallback(Boolean(window.onOpenIntEvent))

    return () => {
      // Cleanup: restore original property
      delete window.onOpenIntEvent
      window.onOpenIntEvent = originalCallback
    }
  }, [])

  // Only query if we have a callback and customerId
  const enabled = Boolean(hasCallback && customerId)

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
      new Date(latestEvent?.timestamp).getTime() > lastEventIdRef.current
    ) {
      lastEventIdRef.current = new Date(latestEvent?.timestamp).getTime()

      // Send each new event to the callback
      data.items.forEach((event) => {
        window.onOpenIntEvent?.(event)
      })
    }
  }, [data])

  return null
}
