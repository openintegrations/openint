import {cn} from '@openint/shadcn/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from '@openint/shadcn/ui'
import {CopyID} from './CopyID'
import {FullScreenCenter} from './FullScreenCenter'
import {Icon} from './Icon'

// Generic error type for use in stories and external systems
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

export interface ErrorPageProps<TError = unknown> {
  /**
   * The error object to display
   */
  error: TError
  /**
   * Optional reset function to try to recover from the error
   */
  reset?: () => void
  /**
   * Optional formatter function for the error message
   */
  formatError?: (error: TError) => string
  /**
   * Optional className for additional styling
   */
  className?: string
}

/**
 * A reusable error page component that displays error details and provides recovery options
 */
export function ErrorPage<TError = unknown>({
  error,
  reset,
  formatError,
  className,
}: ErrorPageProps<TError>) {
  // Default error formatter just returns the error message if it exists
  const defaultFormatter = (err: unknown) => {
    if (err instanceof Error) return err.message
    if (typeof err === 'object' && err !== null && 'message' in err) {
      return String((err as {message: unknown}).message)
    }
    return String(err)
  }

  // Use provided formatter or fallback to default
  const formattedError = formatError
    ? formatError(error)
    : defaultFormatter(error)

  // Try to extract error ID information from different error formats
  const getErrorId = () => {
    const err = error as Record<string, unknown>
    const digest = err['digest'] as string | undefined
    const environmentName = err['environmentName'] as string | undefined

    return `${environmentName || 'Client'}:${digest || 'unknown'}`
  }

  const errorId = getErrorId()

  return (
    <FullScreenCenter className={cn('justify-start pt-12', className)}>
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
                        {JSON.stringify(error, null, 2)}
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
