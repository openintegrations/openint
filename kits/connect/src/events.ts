// example event
// {
//   "name": "connect/connection-connected",
//   "data": {
//     "connectionId": "conn_microsoft_xxxxx"
//   },
//   "id": "evt_xxxx",
//   "ts": 1741530259940
// }
export interface OpenIntEvent {
  name: string
  data: {
    connectionId?: string
    [key: string]: any
  }
  id: string
  ts: number
}

export const frameEventsListener = (
  callback: (event: OpenIntEvent) => void,
): (() => void) => {
  // Add a delay before looking for the iframe
  setTimeout(() => {
    // Try to find specific iframe first
    const targetFrame =
      (window.frames as unknown as Record<string, Window>)[
        'openint-connect-frame'
      ] ||
      (window.document.getElementById('openint-connect-frame') as any)
        ?.contentWindow ||
      window.frames[0] // Fallback to first iframe if specific frame not found

    if (targetFrame) {
      // Send to specific iframe if found
      targetFrame.postMessage('openIntListen', '*')
    } else {
      // Fall back to sending to all windows
      window.postMessage('openIntListen', '*')
    }
  }, 3000) // 3 second delay for it to load. we don't offer initial load events anyways

  const messageListener = (event: MessageEvent) => {
    // Check if the event data has the openIntEvent type
    if (typeof event.data === 'object' && event.data !== null) {
      if (event.data.type === 'openIntEvent' && event.data.event) {
        callback(event.data.event)
        return
      }
    }
  }

  window.addEventListener('message', messageListener)

  // Return a cleanup function to remove the listener
  return () => {
    window.removeEventListener('message', messageListener)
  }
}
