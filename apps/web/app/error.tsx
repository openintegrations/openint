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
      <div className="flex max-w-xl flex-col items-center gap-5 p-4 text-center">
        <div className="mb-3">
          <Icon
            name="AlertCircle"
            className="text-destructive h-[70px] w-[70px]"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {formattedError}
          </h1>
        </div>

        {reset && (
          <Button
            size="lg"
            variant="default"
            className="mt-2 flex items-center gap-2 rounded-lg px-10 py-5 text-base font-medium shadow-sm"
            onClick={reset}>
            <Icon name="RefreshCcw" className="h-4 w-4" />
            Retry
          </Button>
        )}

        <div className="text-muted-foreground mt-3 text-base">
          <p>
            If issue persists, please contact support with the following
            identifier:
          </p>
          <div className="mt-2 flex justify-center">
            <CopyID value={errorId} size="medium" className="mx-auto" />
          </div>
        </div>

        <Accordion type="single" collapsible className="mt-6 w-full max-w-md">
          <AccordionItem
            value="details"
            className="border-border bg-card rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 py-3 text-base font-medium hover:no-underline">
              Details
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 pt-2">
                <div className="bg-secondary-foreground overflow-hidden rounded-md shadow-inner">
                  <div className="p-4 text-sm">
                    <div className="text-background whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(err, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </FullScreenCenter>
  )
}
