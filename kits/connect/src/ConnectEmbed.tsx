import React from 'react'
import {ConnectProps, createConnectIframe} from './common'

export function ConnectEmbed(props: ConnectProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const {token, baseURL, height, width, onEvent, className} = props

  React.useEffect(() => {
    if (!containerRef.current) return

    const iframeWrapper = createConnectIframe(props)
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(iframeWrapper)

    return () => {
      // Cleanup on unmount or props change
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [token, baseURL, className, width, height, onEvent])

  // Initial render is just an empty div
  // After useEffect, it will contain: the iframe content within it. i.e.
  // <div ref={containerRef}>
  //   <div class="connect-embed-wrapper">
  //     <div class="spinner-container">...</div>
  //     <iframe ...></iframe>
  //     <style>...</style>
  //   </div>
  // </div>
  return (
    <div
      className={className || ''}
      style={{width: width || '100%', height: height || '100%'}}
      ref={containerRef}
    />
  )
}

ConnectEmbed.displayName = 'ConnectEmbed'
