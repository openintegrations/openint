'use client'

import type {ReactNode} from 'react'

import React, {useEffect, useState} from 'react'
import {router} from '@openint/api-v1/trpc/_base'
import {cn} from '@openint/shadcn/lib/utils'
import {useMutableSearchParams} from '@openint/ui-v1'
import {useConnectContext} from './ConnectContextProvider'

// Popup geometry (should match openOAuthPopup)
const screenWidth = window.screen.width
const screenHeight = window.screen.height
const width = Math.min(300, screenWidth)
const height = Math.min(200, screenHeight)
const left = Math.max(screenWidth / 2 - width / 2, 0)
const top = Math.max(screenHeight / 2 - height / 2, 0)

export function ConnectOpWrapper({children}: {children: ReactNode}) {
  const {isConnecting, setIsConnecting} = useConnectContext()
  const [hydrated, setHydrated] = useState(false)
  const [showConnectingOverlay, setShowConnectingOverlay] = useState(false)
  const [_, setSearchParams] = useMutableSearchParams()

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Handle delayed showing of the connecting overlay
  React.useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isConnecting) {
      timeout = setTimeout(() => {
        setShowConnectingOverlay(true)
        // doing this to let the popup window open before showing the overlay
      }, 350)
    } else {
      setShowConnectingOverlay(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [isConnecting])

  if (!hydrated) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  return (
    <div className="relative min-h-screen">
      {/* Background blur layer */}
      {showConnectingOverlay && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <div
            className="pointer-events-none fixed z-50"
            style={{left, top, width, height}}>
            <div
              className={cn(
                'pointer-events-auto rounded-lg border border-gray-200 bg-white shadow-xl',
                'flex h-full w-full flex-col items-center justify-center',
                'p-6',
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="connect-interrupted-title">
              <h3
                id="connect-interrupted-title"
                className="mb-2 text-center text-base font-semibold text-gray-900">
                Connection Interrupted
              </h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                Would you like to restart the connection flow?
              </p>
              <div className="flex w-full justify-center gap-2">
                <button
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-medium',
                    'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  )}
                  onClick={() => {
                    setIsConnecting(false)
                  }}>
                  Cancel
                </button>
                <button
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-medium',
                    'bg-primary hover:bg-primary/90 text-white',
                  )}
                  onClick={() => {
                    setIsConnecting(false)
                    setSearchParams({view: 'add'}, {shallow: true})
                  }}>
                  Restart Add Connection
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Content layer */}
      <div className="relative z-0">{children}</div>
    </div>
  )
}
