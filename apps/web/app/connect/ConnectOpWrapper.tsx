'use client'

import type {ReactNode} from 'react'

import {useEffect, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {useConnectContext} from './ConnectContextProvider'

export function ConnectOpWrapper({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const {isConnecting} = useConnectContext()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return <div className="min-h-screen bg-white">{children}</div>
  }
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Background blur layer */}
      {/* Children that want to show on top of this should have z-20 or higher */}
      {isConnecting && (
        <div className="absolute inset-0 z-10 z-50 bg-black/80" />
      )}
      {/* Content layer */}
      <div className="relative z-0">{children}</div>
    </div>
  )
}
