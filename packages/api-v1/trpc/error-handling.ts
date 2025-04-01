import {TRPCClientError} from '@trpc/client'
import {TRPCError} from '@trpc/server'
import {
  TRPC_ERROR_CODES_BY_KEY,
  TRPC_ERROR_CODES_BY_NUMBER,
} from '@trpc/server/rpc'
import type {ZodError} from 'zod'
import {safeJSONParse, z} from '@openint/util'

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
    /** Zod issues */
    issues: z
      .array(
        z.object({
          code: z.string().describe('Zod issue code'),
          expected: z.string().optional().describe('Expected type'),
          received: z.string().optional().describe('Received type'),
          path: z.array(z.string()).describe('JSONPath to the error'),
          message: z.string().describe('Error message'),
        }),
      )
      .optional(),
  })
  .openapi({ref: 'APIError'})

export type APIError = z.infer<typeof zAPIError>

export function parseAPIError(error: unknown): APIError | undefined {
  // Handle TRPCError (from caller)
  if (error instanceof TRPCError) {
    const cause = error.cause as ZodError | undefined
    return zAPIError.parse({
      code: error.code,
      message: error.message,
      data: {
        code: error.code,
        // httpStatus: error.data?.httpStatus,
        // path: error.data?.path,
        stack: error.stack,
      },
      issues: cause?.errors,
    })
  }

  // Handle TRPCClientError
  if (error instanceof TRPCClientError) {
    return zAPIError.safeParse({
      code: error.data?.code,
      message: error.message,
      data: {
        code: error.data?.code,
        httpStatus: error.data?.httpStatus,
        path: error.data?.path,
        stack: error.data?.stack,
      },
      issues: safeJSONParse(error.message) ?? undefined,
    }).data
  }

  return zAPIError.safeParse(error).data
}
