import Image from 'next/image'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'

export interface ConnectTransitionWindowProps {
  onClose?: () => void
  autoCloseInMs?: number
  className?: string
  children: React.ReactNode
}

export function ConnectTransitionWindow({
  onClose,
  autoCloseInMs = -1,
  className,
  children,
}: ConnectTransitionWindowProps) {
  const handleClose = React.useCallback(() => {
    if (onClose) {
      onClose()
    }
    try {
      window.close()
    } catch {}
  }, [onClose])

  React.useEffect(() => {
    if (autoCloseInMs > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoCloseInMs)

      return () => clearTimeout(timer)
    }
  }, [autoCloseInMs, handleClose])

  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-gray-50/50',
        className,
      )}>
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/_assets/openint-logo.svg"
            alt="OpenInt Logo"
            width={147}
            height={41}
            className="h-8 w-auto"
          />
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          {children}
        </div>
      </div>
    </div>
  )
}
