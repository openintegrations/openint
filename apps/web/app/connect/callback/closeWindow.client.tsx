'use client'

import React from 'react'
import {Button} from '@openint/shadcn/ui'
import {ConnectTransitionWindow, LoadingSpinner} from '@openint/ui-v1'
import {useConnectContext} from '../ConnectContextProvider'

export function CloseWindowClient({
  connectorName,
  error,
}: {
  connectorName: string
  error?: string
}) {
  const {setIsConnecting} = useConnectContext()

  const handleClose = React.useCallback(() => {
    setIsConnecting(false)
  }, [setIsConnecting])

  const [isPopup, setIsPopup] = React.useState(false)

  React.useEffect(() => {
    try {
      setIsPopup(Boolean(window.opener))
    } catch {}
  }, [])

  return (
    <ConnectTransitionWindow
      onClose={handleClose}
      autoCloseInMs={error ? -1 : 2000}>
      {error ? (
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            There was an Error connecting to {connectorName}
          </h1>
          <p className="mt-4 text-sm text-gray-600">
            <b>Error:</b> {error}
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Successfully connected to {connectorName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isPopup
              ? 'This window will automatically close'
              : 'You can close this window and return to the application'}
          </p>
          <LoadingSpinner className="mt-4" />
        </div>
      )}
      {isPopup && (
        <Button className="mt-4" onClick={handleClose}>
          Close Window
        </Button>
      )}
    </ConnectTransitionWindow>
  )
}
