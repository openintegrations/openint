'use client'

import React from 'react'

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
