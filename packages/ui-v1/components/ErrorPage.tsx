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
                      {JSON.stringify(error, null, 2)}
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
