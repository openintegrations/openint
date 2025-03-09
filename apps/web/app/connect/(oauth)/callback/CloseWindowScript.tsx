'use client'

import {useEffect} from 'react'
import {FullScreenCenter} from '@/components/FullScreenCenter'

export function CloseWindowScript() {
  useEffect(() => {
    console.log('New OAuthCallback, extracting params and sending to parent')

    // TODO: @pellicceama  either redirect if there is a redirect url
    // or close window. need to sigle-window use cases for connect
    // The client SDK should allow redirect url to be configurable
    // something like a window = 'same' | 'new-window' | 'auto' where auto uses feature detection
    // to know what is best
    try {
      // Extract all search params from URL
      const searchParams = new URLSearchParams(window.location.search)

      // Convert searchParams to a plain object
      const paramsObject: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        paramsObject[key] = value
      })

      // Send message to parent window with all extracted params
      if (window.opener) {
        window.opener.postMessage(paramsObject, '*')
        console.log('Sent auth data to parent window', paramsObject)
      } else {
        console.error('No opener window found')
      }
    } catch (error) {
      console.error('Error processing OAuth callback:', error)
    }

    // Close the window after sending the message
    setTimeout(() => window.close(), 1000)
  }, [])

  return (
    <FullScreenCenter>
      <span className="mb-2">
        Authentication successful. This window will close automatically...
      </span>
    </FullScreenCenter>
  )
}
