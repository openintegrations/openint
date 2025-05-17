'use client'

import {useSearchParams} from 'next/navigation'
import React, {Suspense} from 'react'
import {ConnectTransitionWindow, LoadingSpinner} from '@openint/ui-v1'

function NavigateContent() {
  const searchParams = useSearchParams()
  const navigateTo = searchParams.get('navigate_to')
  const connectorName = searchParams.get('connector_name') || 'connector'

  React.useEffect(() => {
    if (navigateTo) {
      window.location.href = atob(navigateTo)
    }
  }, [navigateTo])

  return (
    <ConnectTransitionWindow>
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-medium">Navigating to {connectorName}...</p>
        <LoadingSpinner size="lg" />
      </div>
    </ConnectTransitionWindow>
  )
}

export default function NavigatePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NavigateContent />
    </Suspense>
  )
}
