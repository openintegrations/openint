'use client'

import {useEffect} from 'react'
import {GetIFrameProps} from '../../src/common'
import {OpenIntConnectEmbed} from '../../src/embed-react'
import {OpenIntFrontend} from '../../src/popup'

export function OpenIntConnectClient({
  baseUrl,
  params,
}: {
  baseUrl: string
  params: GetIFrameProps['params']
}) {
  // Use useEffect to ensure the listener is set up only once when the component mounts
  useEffect(() => {
    const unsubscribe = OpenIntFrontend.listen((event) => {
      console.log('OpenInt Event Received', event.data)
    })

    // Clean up the listener when the component unmounts
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, []) // Empty dependency array ensures this runs only once on mount


  return (
    <div className="overflow-hidden rounded-lg border">
      <OpenIntConnectEmbed
        baseUrl={baseUrl}
        params={params}
        width={700}
        height={700}
      />
    </div>
  )
}
