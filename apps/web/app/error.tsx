'use client'

// Error boundaries must be Client Components
import {Button} from '@openint/shadcn/ui'
import {safeJSONParse} from '@openint/util/json-utils'
import {zZodErrorEnriched} from '@openint/util/zod-utils'

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
   */
  reset: () => void
}

/** TODO: Leverage parseAPIError in addition */
function RenderError({error}: Pick<PageErrorProps, 'error'>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  ;(window as any).error = error
  if (error.name === 'ZodError') {
    const err = zZodErrorEnriched.safeParse(safeJSONParse(error.message)).data
    return (
      <>
        <h2 className="font-mono text-xl">ZodError</h2>
        <pre>{JSON.stringify(err, null, 2)}</pre>
      </>
    )
  } else if (error.name === 'TRPCError') {
    // We are missing error.code information at this point. Will have to make `message` more informative
  } else if (error.name === 'TRPCClientError') {
    // We are missing error.code information at this point. Will have to make `message` more informative
  }
  return (
    <>
      <h2 className="font-mono text-xl">{error.name}</h2>
      <p>{error.message}</p>
    </>
  )
}

/** @see https://nextjs.org/docs/app/api-reference/file-conventions/error */
export default function DefaultPageError({error, reset}: PageErrorProps) {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <RenderError error={error} />
      <pre>
        Digest: {error.digest} in {error.environmentName}
      </pre>
      {/* {apiError && <pre>{JSON.stringify(apiError, null, 2)}</pre>} */}
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }>
        Try again
      </Button>
    </div>
  )
}
