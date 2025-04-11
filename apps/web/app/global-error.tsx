'use client'

import type {PageErrorProps} from './error'
import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import {useEffect} from 'react'

// https://nextjs.org/docs/14/app/building-your-application/routing/error-handling

/**
 * Should be a noop given that we have a error.tsx which will catch anything that would
 * otherwise go to global-error.tsx. However just for the sake of completeness, we'll add
 * sentry here.
 */
export default function GlobalError({error}: PageErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
