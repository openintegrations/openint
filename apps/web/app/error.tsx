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
import {CopyID, FullScreenCenter, Icon} from '@openint/ui-v1'

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

  // Use the formatError function to get the properly formatted error message
  const formattedError = formatError(err)

  const errorId = `${err.environmentName || 'Client'}:${error.digest || 'unknown'}`

  return (
    <FullScreenCenter className="justify-start pt-12">
      <div className="flex max-w-md flex-col items-center gap-6 p-5 text-center">
        <div className="bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full">
          <Icon name="XCircle" className="text-destructive h-8 w-8" />
        </div>

        <div className="space-y-2.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            An error occurred
          </h1>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm/relaxed">
            {formattedError}
          </p>
        </div>

        {reset && (
          <Button
            size="default"
            variant="default"
            className="mt-2 flex items-center gap-2"
            onClick={reset}>
            <Icon name="RefreshCcw" className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}

        <div className="text-muted-foreground mt-2 max-w-sm text-xs">
          <p>
            If issue persists, please contact support with the following
            identifier:
          </p>
          <div className="mt-3 flex justify-center">
            <CopyID value={errorId} size="compact" className="mx-auto" />
          </div>
        </div>

        <div className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50">
          <Accordion type="single" collapsible>
            <AccordionItem value="details" className="border-0">
              <AccordionTrigger className="text-muted-foreground px-4 py-2 text-xs font-medium hover:no-underline">
                Technical details
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 pb-4 pt-1">
                  <div className="rounded-md border border-gray-200 bg-white">
                    <div className="p-3 text-xs">
                      <div className="text-muted-foreground whitespace-pre-wrap break-words font-mono">
                        {JSON.stringify(err, null, 2)}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </FullScreenCenter>
  )
}
