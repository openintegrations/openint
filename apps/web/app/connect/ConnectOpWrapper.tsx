'use client'

import {ReactNode, useEffect, useState} from 'react'
import {useConnectContext} from './ConnectContextProvider'

export function ConnectOpWrapper({children}: {children: ReactNode}) {
  const {isConnecting} = useConnectContext()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  return (
    <div className="relative min-h-screen">
      {/* Background blur layer */}
      {/* Children that want to show on top of this should have z-20 or higher */}
      {isConnecting && (
        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm" />
      )}
      {/* Content layer */}
      <div className="relative z-0">{children}</div>
    </div>
  )
}
