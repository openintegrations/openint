'use client'

// Error boundaries must be Client Components

// We error.tsx instead of global-errors.tsx
// because we dont' want to have to separately render a html element
// as global-error bypasses root layout
// Also global error does not have a reset function
// but it does show issues right away on page load, while individual error.tsx
// does not show issues right away on page load but it is acessible in the bottom
// left corner of the screen instead.
import * as Sentry from '@sentry/nextjs'
import React from 'react'
import {formatError, parseError} from '@openint/events/errors'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from '@openint/shadcn/ui'
import {FullScreenCenter, Icon} from '@openint/ui-v1'

export type PageError = Error & {
  /**
   * Name of the original error prior to serialization
   * e.g. 'ZodError' or 'TRPCError'
   */
  name: string
  /**
   * Errors forwarded from Client Components show the original Error message.
   * Errors forwarded from Server Components show a generic message with an identifier.
   * This is to prevent leaking sensitive details. You can use the identifier,
   * under errors.digest, to match the corresponding server-side logs.
   */
  message: string
  digest?: string

  /** Undocumented property. Usually 'Server' | 'Client' */
  environmentName?: string
}

/** @see https://nextjs.org/docs/app/api-reference/file-conventions/error#props */
export interface PageErrorProps {
  error: PageError
  /**
   * The cause of an error can sometimes be temporary. In these cases, trying again
   * might resolve the issue.
   * An error component can use the reset() function to prompt the user to attempt
   * to recover from the error. When executed, the function will try to re-render
   * the error boundary's contents. If successful, the fallback error component is
   * replaced with the result of the re-render.
   *
   * Empirically, this does not always exist. In particular it does not seem to exist
   * inside global-error.tsx.
   */
  reset?: () => void
}

/** @see https://nextjs.org/docs/app/api-reference/file-conventions/error */
export default function DefaultPageError({error, reset}: PageErrorProps) {
  React.useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  ;(window as any).error = error
  const err = parseError(error)
  ;(window as any).err = err

  return (
    <FullScreenCenter className="justify-start pt-10">
      <div className="flex max-w-xl flex-col gap-4 p-4">
        <h2 className="text-2xl font-bold">{formatError(err)}</h2>
        {reset && (
          <Button className="self-center" onClick={reset}>
            <Icon name="RefreshCcw" className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
        <p>
          If issue persists, please contact support with the following
          identifier{' '}
          <span className="font-mono">
            {err.environmentName}:{error.digest}
          </span>
        </p>
        <Accordion type="single" collapsible>
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>
              <pre>{JSON.stringify(err, null, 2)}</pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </FullScreenCenter>
  )
}
