'use client'

import {useEffect} from 'react'
import {FullScreenCenter} from '@/components/FullScreenCenter'

export function CloseWindowScript() {
  useEffect(() => {
    console.log('New OAuthCallback, closing window')
    window.close()
  }, [])

  return (
    <FullScreenCenter>
      <span className="mb-2">
        Authentication successful. This window will close automatically...
      </span>
    </FullScreenCenter>
  )
}
