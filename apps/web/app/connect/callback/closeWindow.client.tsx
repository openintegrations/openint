'use client'

import React from 'react'
import {LoadingSpinner} from '@openint/ui-v1'

export function CloseWindowClient({
  connectorName,
  error,
}: {
  connectorName: string
  error?: string
}) {
  const [isPopup, setIsPopup] = React.useState(false)

  React.useEffect(() => {
    // Check if the current window is a popup (has an opener)
    setIsPopup(Boolean(window.opener))

    if (!error) {
      setTimeout(() => {
        console.log('closing popup')
        window.close()
      }, 3000)
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {error ? (
        <div>
          <h1>There was an Error connecting to {connectorName}</h1>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <h1>Successfully connected to {connectorName}</h1>
          <p>
            {isPopup
              ? 'This window will automatically close'
              : 'You can close this window and return to the application'}
          </p>
          <LoadingSpinner />
        </div>
      )}
      <button
        onClick={() => {
          if (window.opener) {
            window.close()
          } else if (error) {
            // If not a popup and there was an error, go back
            window.history.back()
          } else {
            // If not a popup and successful, provide indication
            window.location.href = '/'
          }
        }}>
        {isPopup ? 'Close Window' : error ? 'Go Back' : 'Return to Home'}
      </button>
    </div>
  )
}
