'use client'

import type {ConnectProps} from './common'

import React from 'react'
import {createConnectIframe} from './common'

export function ConnectButton({
  text = 'Manage Integrations',
  // TODO add styles in a way that makes sense alongside className
  ...props
}: ConnectProps & {text?: string}) {
  const [isOpen, setIsOpen] = React.useState(false)
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
  }, [token, baseURL, className, width, height, onEvent, props])

  // Close when clicking outside modal
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const modalContent = document.querySelector('.openint-modal')
      if (modalContent && !modalContent.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-secondary hover:bg-secondary/80 rounded px-4 py-2 font-medium">
        {text}
      </button>

      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isOpen ? 'visible' : 'hidden'
        }`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80" />
        <div className="openint-modal relative z-10 w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
          {/* Body - Contains the iframe */}
          <div className="p-6">
            <div
              ref={containerRef}
              className="w-full"
              style={{
                height: height || '500px',
                width: '100%',
                minHeight: '400px',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

ConnectButton.displayName = 'ConnectButton'
