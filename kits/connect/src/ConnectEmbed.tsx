import React from 'react'
import {ConnectProps, createMagicLinkUrl} from './common'
import {frameEventsListener, OpenIntEvent} from './events'

export interface ConnectEmbedProps
  extends ConnectProps,
    React.IframeHTMLAttributes<HTMLIFrameElement> {
  onReady?: () => void
  // TODO: Make the events typed
  onEvent?: (event: OpenIntEvent, unsubscribe: () => void) => void
}

const DEFAULT_HEIGHT = 500
const DEFAULT_WIDTH = 350
export const ConnectEmbed = React.memo(
  React.forwardRef(
    (
      props: ConnectEmbedProps,
      forwardedRef: React.ForwardedRef<HTMLIFrameElement>,
    ) => {
      const {baseUrl, params, onReady, onEvent, ...iframeProps} = props

      const url = React.useMemo(
        () => createMagicLinkUrl({baseUrl, params}),
        [baseUrl, params],
      )

      const [loading, setLoading] = React.useState(true)

      React.useEffect(() => {
        if (
          typeof iframeProps.height === 'number' &&
          iframeProps.height < DEFAULT_HEIGHT
        ) {
          console.warn(
            'Optimal height for Connect is 500px. Using 500px instead.',
          )
        }
        if (typeof iframeProps.width === 'number' && iframeProps.width < 350) {
          console.warn(
            'Minimum width for Connect is 350px. Using 350px instead.',
          )
        }
      }, [iframeProps.height, iframeProps.width])

      const height =
        typeof iframeProps.height === 'number'
          ? iframeProps.height > DEFAULT_HEIGHT
            ? iframeProps.height
            : DEFAULT_HEIGHT
          : iframeProps.height

      const width =
        typeof iframeProps.width === 'number'
          ? iframeProps.width > DEFAULT_WIDTH
            ? iframeProps.width
            : DEFAULT_WIDTH
          : iframeProps.width || DEFAULT_WIDTH

      // Add a more reliable way to know iframe has fully finished loading
      // by sending message from iframe to parent when ready
      return (
        <div className={`connect-embed-wrapper ${props.className}`}>
          <div
            className={`spinner-container ${loading ? 'loading' : 'loaded'}`}>
            <svg className="spinner" viewBox="0 0 50 50">
              <circle
                className="path"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="5"></circle>
            </svg>
          </div>
          <iframe
            // IMPORTANT: ensure to NOT change this as its used by
            // popup.tsx for listening to events from the iframe
            name="openint-connect-frame"
            id="openint-connect-frame"
            {...iframeProps}
            ref={forwardedRef}
            onLoad={() => {
              setLoading(false)
              onReady?.()
              if (onEvent) {
                const unsubscribe = frameEventsListener((event) => {
                  onEvent(event, unsubscribe)
                })
              }
            }}
            src={url}
            width={width}
            height={height}
          />

          <style>{`
        .connect-embed-wrapper {
          display: flex;
          height: ${height}px;
          position: relative;
        }
        .spinner-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: ${params?.theme === 'dark' ? '#1C1C1C' : 'white'};
          transition: opacity 0.3s ease;
          max-width: ${width}px;
          max-height: ${height}px;
        }
        .spinner-container.loaded {
          opacity: 0;
          pointer-events: none;
        }
        .spinner {
          animation: rotate 2s linear infinite;
          width: 30px;
          height: 30px;
        }
        .path {
          stroke: #5652BF;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
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
      `}</style>
        </div>
      )
    },
  ),
)

ConnectEmbed.displayName = 'ConnectEmbed'
