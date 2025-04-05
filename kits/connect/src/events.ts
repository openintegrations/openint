// example event
// {
//   "name": "connect/connection-connected",
//   "data": {
//     "connectionId": "conn_microsoft_xxxxx"
//   },
//   "id": "evt_xxxx",
//   "ts": 1741530259940
// }

// TODO: pull this in from the server OAS spec
// NOTE: connect.loaded is currently only client side
export type EventName = 'connect.connection-connected' | 'connect.loaded'

export interface OpenIntEvent {
  name: EventName
  data?: {
    connection_id?: string
    [key: string]: any
  }
  id: string // Should start with 'evt_'
  ts: number
}

export const createClientOnlyEventId = (): string => {
  return `evt_CLIENTONLY_${Math.random().toString(36).substring(2, 15)}`
}

export const frameEventsListener = (
  callback: (event: OpenIntEvent) => void,
): (() => void) => {
  // Use a more reliable approach than a fixed delay
  const iframe = document.getElementById(
    'openint-connect-frame',
  ) as HTMLIFrameElement
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage('openIntListen', '*')
  } else {
    // Set up a mutation observer to detect when the iframe is added
    const observer = new MutationObserver(() => {
      const iframe = document.getElementById(
        'openint-connect-frame',
      ) as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('openIntListen', '*')
        observer.disconnect()
      }
    })
    observer.observe(document.body, {childList: true, subtree: true})
  }

  const messageListener = (event: MessageEvent) => {
    // Check if the event data has the openIntEvent type
    if (typeof event.data === 'object' && event.data !== null) {
      if (event.data.type === 'openIntEvent' && event.data.event) {
        let payload = event.data.event
        // the backend may still be sending it as connectionId (camel case)
        if (payload.data?.connectionId) {
          payload.data.connection_id = payload.data.connectionId
          delete payload.data.connectionId
        }

        callback(payload as OpenIntEvent)
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
