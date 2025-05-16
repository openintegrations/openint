'use client'

import type {ConnectProps} from './common'

import React from 'react'
import {createConnectIframe} from './common'

export function ConnectButton(props: ConnectProps) {
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
      const modalContent = document.querySelector('.modal-content')
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
        Connect
      </button>

      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isOpen ? 'visible' : 'hidden'
        }`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80" />
        <div className="modal-content relative z-10 w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Connect Integration
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

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
          <div className="border-t border-gray-200 bg-gray-50 p-4 text-right">
            <button
              onClick={() => setIsOpen(false)}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

ConnectButton.displayName = 'ConnectButton'
