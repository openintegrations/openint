import type {OpenIntEvent} from './events'

import {createClientOnlyEventId, frameEventsListener} from './events'

export interface ConnectProps {
  token: string
  baseURL?: string
  width?: number
  height?: number
  onEvent?: (event: OpenIntEvent, unsubscribe: () => void) => void
  className?: string
  // TODO: pull these from a common types package that includes connector name,
  // albeit a customer should be able to pass in an unknown string in case these get out of date?
  connectOptions?: {
    // TODO: expand to https://coda.io/d/_d6fsw71RNUB/Implementing-a-native-UI-for-Connect-via-Core-APIs-and-Deep-Link_susYw00i
    returnUrl?: string
    connectorNames?: string[]
    view?: 'add' | 'manage'
    debug?: boolean
    isMagicLink?: boolean
    // TODO: add theme enum and colors object
  }
}
const DEFAULT_HOST = 'https://connect.openint.dev'
const createMagicLinkUrl = ({
  baseURL = DEFAULT_HOST,
  token,
  connectOptions = {},
}: ConnectProps) => {
  const url = new URL(baseURL)
  url.searchParams.set('token', token)
  Object.entries(connectOptions).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      url.searchParams.set(
        // basic camelCase to snake_case conversion
        key
          // convert first letter to lowercase for pascal case scenario?
          .replace(/^([A-Z])/, (match) => match.toLowerCase())
          // convert remaining uppercase letters to _ + lowercase
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase(),
        value,
      )
    }
  })
  return url.toString()
}

export function createConnectIframe(props: ConnectProps) {
  const {width, height, onEvent} = props

  // Create wrapper div
  const wrapper = document.createElement('div')
  wrapper.className = `connect-embed-wrapper`

  // Create spinner container
  const spinnerContainer = document.createElement('div')
  spinnerContainer.className = 'spinner-container loading'
  spinnerContainer.innerHTML = `
    <svg class="spinner" viewBox="0 0 50 50" color="#000000">
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
  // note: connect-embed-warpper .spinner-container background
  // was ${connectOptions?.theme === 'dark' ? '#1C1C1C' : 'white'};
  const style = document.createElement('style')

  style.textContent = `
     .connect-embed-wrapper {
          display: flex;
          height: ${height || '100'}${height ? 'px' : '%'};
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
          background: white; 
          transition: opacity 0.3s ease;
          max-width: ${width || '100'}${width ? 'px' : '%'};
          max-height: ${height || '100'}${height ? 'px' : '%'};
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
        /* IMPORTANT: this needs to match the LoadingSpinner color in both light and dark themes */
          stroke: #000000 !important; 
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
