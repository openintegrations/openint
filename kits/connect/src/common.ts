import {
  createClientOnlyEventId,
  frameEventsListener,
  type OpenIntEvent,
} from './events'

export interface ConnectProps {
  token: string
  baseUrl?: string
  width?: number
  height?: number
  onEvent?: (event: OpenIntEvent, unsubscribe: () => void) => void
  className?: string
  connectParams?: {
    displayName?: string
    connectionId?: string
    connectorNames?: string
    integrationIds?: string
    view?: 'add' | 'add-deeplink' | 'manage' | 'manage-deeplink'
    theme?: 'light' | 'dark'
  }
}
const DEFAULT_HOST = 'https://connect.openint.dev'
const createMagicLinkUrl = ({
  baseUrl = DEFAULT_HOST,
  token,
  connectParams = {},
}: ConnectProps) => {
  const url = new URL(baseUrl)
  // TODO; create a new view in the server called 'default' if there's no view and
  // smartly load the right view based on whether the user has connections or not
  if (!connectParams.view) {
    url.searchParams.set('view', 'add')
  }
  url.searchParams.set('token', token)
  Object.entries(connectParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

export function createConnectIframe(props: ConnectProps) {
  const {connectParams, width, height, onEvent, className} = props

  // Create wrapper div
  const wrapper = document.createElement('div')
  wrapper.className = `connect-embed-wrapper ${className || ''}`

  // Create spinner container
  const spinnerContainer = document.createElement('div')
  spinnerContainer.className = 'spinner-container loading'
  spinnerContainer.innerHTML = `
    <svg class="spinner" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
  `

  // Create iframe
  const iframe = document.createElement('iframe')
  iframe.name = 'openint-connect-frame'
  iframe.id = 'openint-connect-frame'

  iframe.width = String(width || '100%')
  iframe.height = String(height || '100%')

  // Add styles
  const style = document.createElement('style')
  style.textContent = `
     .connect-embed-wrapper {
          display: flex;
          height: ${width || '100%'}px;
          position: relative;
        }
        .connect-embed-wrapper .spinner-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: ${connectParams?.theme === 'dark' ? '#1C1C1C' : 'white'};
          transition: opacity 0.3s ease;
          max-width: ${width || '100%'}px;
          max-height: ${height || '100%'}px;
        }
        .connect-embed-wrapper .spinner-container.loaded {
          opacity: 0;
          pointer-events: none;
        }
        .connect-embed-wrapper .spinner {
          animation: openint-connect-rotate 2s linear infinite;
          width: 30px;
          height: 30px;
        }
        .connect-embed-wrapper .path {
          stroke: #5652BF;
          stroke-linecap: round;
          animation: openint-connect-dash 1.5s ease-in-out infinite;
        }
        @keyframes openint-connect-rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes openint-connect-dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }
  `

  iframe.onload = () => {
    spinnerContainer.classList.remove('loading')
    spinnerContainer.classList.add('loaded')

    if (onEvent) {
      const unsubscribe = frameEventsListener((event) => {
        onEvent(event, unsubscribe)
      })
      onEvent(
        {
          name: 'connect.loaded',
          id: createClientOnlyEventId(),
          ts: Date.now(),
        },
        unsubscribe,
      )
    }
  }
  iframe.src = createMagicLinkUrl(props)
  wrapper.appendChild(spinnerContainer)
  wrapper.appendChild(iframe)
  wrapper.appendChild(style)

  return wrapper
}
