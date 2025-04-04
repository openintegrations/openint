import {TRPCClientError} from '@trpc/client'
import {TRPCError} from '@trpc/server'
import {
  TRPC_ERROR_CODES_BY_KEY,
  TRPC_ERROR_CODES_BY_NUMBER,
} from '@trpc/server/rpc'
import {
  JSONRPC2_TO_HTTP_CODE,
  RouterCallerErrorHandler,
} from '@trpc/server/unstable-core-do-not-import'
import {safeJSONParse} from '@openint/util/json-utils'
import {z, ZodError, type Z} from '@openint/util/zod-utils'

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

const zIssue = z
  .object({
    code: z.string().describe('Zod issue code'),
    expected: z.string().optional().describe('Expected type'),
    received: z.string().optional().describe('Received type'),
    path: z.array(z.string()).describe('JSONPath to the error'),
    message: z.string().describe('Error message'),
  })
  .openapi({ref: 'ZodIssue'})

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
    issues: z.array(zIssue).optional(),
    output_issues: z.array(zIssue).optional(),
  })
  .openapi({ref: 'APIError'})

export type APIError = Z.infer<typeof zAPIError>

export function parseAPIError(error: unknown): APIError | undefined {
  // Handle TRPCError (from caller)
  if (error instanceof TRPCError) {
    const cause = error.cause as ZodError | undefined
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
        output_issues: isOutputError ? cause?.errors : undefined,
      },
      {
        errorMap: (issue, ctx) => {
          console.warn(
            'Did you forget to add custom onError handler when using trpcRouter?',
          )
          return {message: issue.message || ctx.defaultError}
        },
      },
    )
  }

  // Handle TRPCClientError
  if (error instanceof TRPCClientError) {
    return zAPIError.parse({
      code: error.data?.code,
      message: error.message,
      data: {
        code: error.data?.code,
        httpStatus: error.data?.httpStatus,
        path: error.data?.path,
        stack: error.data?.stack,
      },
      issues: error.shape.issues ?? safeJSONParse(error.message) ?? undefined,
      output_issues: error.shape.output_issues ?? undefined,
    })
  }

  return zAPIError.safeParse(error).data
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
  // console.log('onError', {error, path})

  Object.assign(error, {path})
  // if (error instanceof ZodError) {
  //   Object.assign(error, {
  //     issues: error.errors,
  //   })
  // }
}
