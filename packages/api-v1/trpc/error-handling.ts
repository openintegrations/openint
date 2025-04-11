import type {Z, zZodIssue} from '@openint/util/zod-utils'
import type {
  DefaultErrorShape,
  ErrorFormatter,
  RouterCallerErrorHandler,
} from '@trpc/server/unstable-core-do-not-import'
import {TRPCClientError} from '@trpc/client'
import {TRPCError} from '@trpc/server'
import {
  TRPC_ERROR_CODES_BY_KEY,
  TRPC_ERROR_CODES_BY_NUMBER,
} from '@trpc/server/rpc'
import {JSONRPC2_TO_HTTP_CODE} from '@trpc/server/unstable-core-do-not-import'
import {safeJSONParse} from '@openint/util/json-utils'
import {isZodError, z, zZodIssues} from '@openint/util/zod-utils'

/** For testing. Consider exporting from /trpc route instead? */
export {TRPCClientError} from '@trpc/client'
export {initTRPC, TRPCError} from '@trpc/server'
export {fetchRequestHandler} from '@trpc/server/adapters/fetch'

export const zErrorCode = z
  .enum(
    Object.keys(TRPC_ERROR_CODES_BY_KEY) as [
      keyof typeof TRPC_ERROR_CODES_BY_KEY,
    ],
  )
  .openapi({ref: 'ErrorCode'})

export const zErrorNumber = z
  .number()
  .refine((n) => n in TRPC_ERROR_CODES_BY_NUMBER, 'Invalid error number')
  .openapi({ref: 'ErrorNumber'})

export const zHTTPStatus = z
  .number()
  .refine((n) => n >= 100 && n < 600, 'Invalid HTTP status')
  .openapi({ref: 'HTTPStatus'})

export const zAPIError = z
  .object({
    code: zErrorCode,
    message: z.string(),
    data: z
      .object({
        code: zErrorCode,
        httpStatus: zHTTPStatus,
        path: z.string().describe('TRPC handler path'),
        stack: z.string().optional().describe('Stack trace only in dev'),
      })
      .optional(),
    /** Input issues */
    input: z.unknown().optional(),
    issues: zZodIssues.optional(),
    /** Output issues */
    output: z.unknown().optional(),
    output_issues: zZodIssues.optional(),
  })
  .openapi({ref: 'APIError'})

export type APIError = Z.infer<typeof zAPIError>

// MARK: - Caller / client side

export function parseAPIError(error: unknown): APIError | undefined {
  // Handle TRPCError (from caller)
  if (error instanceof TRPCError) {
    const cause = isZodError(error.cause) ? error.cause : undefined
    const isOutputError = error.message === 'Output validation failed'
    return zAPIError.parse(
      {
        code: error.code,
        message: error.message,
        data: {
          code: error.code,
          httpStatus: JSONRPC2_TO_HTTP_CODE[error.code],
          path: (error as any).path,
          stack: error.stack,
        },
        issues: isOutputError ? undefined : cause?.errors,
        input: isOutputError ? undefined : cause?.data,
        output_issues: isOutputError ? cause?.errors : undefined,
        output: isOutputError ? cause?.data : undefined,
      },
      {
        errorMap: (_, ctx) => {
          console.warn(
            'Did you forget to add custom onError handler when using trpcRouter?',
          )
          return {message: ctx.defaultError}
        },
      },
    )
  }

  // Handle TRPCClientError
  if (error instanceof TRPCClientError) {
    return zAPIError.parse({
      ...error.shape,
      // Error.code is a JSON RPC 2.0 code, not a TRPC error code otherwise
      code: error.data?.code,
    })
  }

  return zAPIError.safeParse(error).data
}

// MARK: - Router / server side

type ZodIssue = Z.infer<typeof zZodIssue>

export interface ErrorShape extends DefaultErrorShape {
  issues?: ZodIssue[]
  output_issues?: ZodIssue[]
}

// Not quite default error shape, but we can live with it for now
export const errorFormatter: ErrorFormatter<unknown, DefaultErrorShape> = (
  opts,
) => {
  const {shape, error} = opts
  const trpcErr = error instanceof TRPCError ? error : undefined
  const zodErr = isZodError(trpcErr?.cause) ? trpcErr.cause : undefined

  // console.log('errorFormatter', opts)
  // console.log('error', error.message)

  return {
    ...shape,
    ...(zodErr && error.message === 'Output validation failed'
      ? {output_issues: zodErr.errors, output: zodErr.data}
      : {}),
    ...(zodErr && error.message === 'Input validation failed'
      ? {issues: zodErr?.errors, input: zodErr.data}
      : {}),
  }
}

/**
 * TRPCError does not have path, so we need to add it in order to normalize it
 * properly for parseAPIError
 *
 * This only works for the direct createCaller pattern though.
 */
export const onError: RouterCallerErrorHandler<unknown> = ({
  error,
  path,
  // input,
  // ctx,
  // type,
}) => {
  // Consider adding input and context to make error even more accurate
  // console.log('onError', {error, path, input, ctx, type})
  Object.assign(error, {path})
  // TODO: Better way to check if it's an input error
  const isInputError = safeJSONParse(error.message) != null
  if (isInputError) {
    Object.assign(error, {message: 'Input validation failed'})
  }
  // for client side error handling
  console.log('onError', error)
  Object.assign(error, {
    message: `[${error.code}] ${error.message}`,
  })
}
