'use client'

import React from 'react'
import {Tabs} from '@openint/shadcn/ui'
import {useStateFromSearchParams} from '@openint/ui-v1'

/**
 * Tabs that automatically sync with search params
 * However this does not work very well so far because it causes the entire server side route to reload
 * which is not actually intentional
 *
 */
export function TabsClient({
  paramKey,
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, 'value' | 'onValueChange'> & {
  paramKey: string
}) {
  const [value, setValue] = useStateFromSearchParams(paramKey, {
    defaultValue: props.defaultValue,
    shallow: true,
  })

  return <Tabs {...props} value={value} onValueChange={setValue} />
}

// TODO: See if we can leverage other components such as Sentry's ErrorBoundary instead

/** ErrorBoundary and Suspense combined for both loading and error states */
export class ErrorBoundarySuspense extends React.Component<{
  children: React.ReactNode
  fallback?: React.ReactNode
  error?: React.ReactNode
}> {
  override state = {hasError: false}

  static getDerivedStateFromError() {
    return {hasError: true}
  }

  override render() {
    if (this.state.hasError) {
      return this.props.error ?? this.props.fallback ?? null
    }
    return (
      <React.Suspense fallback={this.props.fallback}>
        {this.props.children}
      </React.Suspense>
    )
  }
}
