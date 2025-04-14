// Errors should be thought of nothing but events as well.
// To be handled just like any other. With a code and schema.

import type {NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import type {ErrorCode, ErrorMessageMap} from './errors.def'

import {TRPCError} from '@trpc/server'
import {safeJSONParse} from '@openint/util/json-utils'
import {titleCase} from '@openint/util/string-utils'
import {infoFromZodError, isZodError, z} from '@openint/util/zod-utils'
import {
  errorMap,
  errorMessageMap,
  isTRPCErrorCode,
  trpcErrorMap,
} from './errors.def'

export const zErrorCode = z.enum(Object.keys(errorMap) as [ErrorCode])

export const zDiscriminatedError = z.intersection(
  z.object({
    /** nextjs error digest for collelating server side log with error displayed to client */
    digest: z.string().optional(),
    environmentName: z.string().optional(),
  }),
  z.discriminatedUnion(
    'code',
    Object.entries(errorMap).map(([code, shape]) =>
      z.object({
        code: z.literal(code),
        data: z.object(shape),
      }),
    ) as unknown as NonEmptyArray<
      {
        [k in keyof typeof errorMap]: Z.ZodObject<{
          code: Z.ZodLiteral<k>
          data: Z.ZodObject<(typeof errorMap)[k]>
        }>
      }[keyof typeof errorMap]
    >,
  ),
)

export type DiscriminatedError<TCode extends ErrorCode = ErrorCode> = Extract<
  Z.infer<typeof zDiscriminatedError>,
  {code: TCode}
>

// MARK: - Core functions to interact with errors

export function makeError<TCode extends ErrorCode>(
  code: TCode,
  data: DiscriminatedError<TCode>['data'],
) {
  const schema = errorMap[code]
  const parsedData = z.object(schema).parse(data)

  if (isTRPCErrorCode(code)) {
    const message =
      z.object({message: z.string()}).strict().safeParse(parsedData).data
        ?.message ?? JSON.stringify(parsedData, null, 2)

    const err = new TRPCError({code, message})
    // Assgning name as code breaks the trpc server built in error handling
    // TOFO: Figure out a better option and add test for throwing error inside trpc
    Object.assign(err, {data})
    return err as Error & DiscriminatedError<TCode>
  } else {
    const message = JSON.stringify(parsedData, null, 2)
    // Perhaps change to a unknown error here if it does not pass validation?
    const err = new Error(message)
    Object.assign(err, {data, name: code, code})
    return err as unknown as Error & DiscriminatedError<TCode>
  }
}

export function throwError<TCode extends ErrorCode>(
  code: TCode,
  data: DiscriminatedError<TCode>['data'],
): never {
  throw makeError(code, data)
}

/**
 * Should probably be named parsePlainError to distinguish from parseAPIError related logic
 * that try to transform errors we did not "make" into plain error to then be parsed
 */
export function parseError(error: unknown): DiscriminatedError {
  if (typeof error !== 'object' || error == null) {
    return {code: 'UNKNOWN_ERROR', data: {message: String(error)}}
  }

  const err = error as {
    name?: unknown
    code?: unknown
    message?: string
    data?: unknown
    digest?: string
    environmentName?: string
  }
  const parsed = zDiscriminatedError.safeParse({
    // Shall we be more explicit about the different conditions? We handle
    // 1) discriminated error 2) discriminated error with data in JSON message 3) manually constructed trpc error
    code: err.code ?? err.name,
    data: err.data ?? safeJSONParse(err.message) ?? {message: err.message},
    digest: err.digest,
    environmentName: err.environmentName,
  })

  if (parsed.success) {
    return parsed.data
  }

  return {code: 'UNKNOWN_ERROR', data: {message: String(error as unknown)}}
}

export function isError<TCode extends ErrorCode>(
  error: unknown,
  code?: TCode,
): error is DiscriminatedError<TCode> {
  return parseError(error).code === code
}

export function formatError(error: DiscriminatedError) {
  const msgOrFn = (errorMessageMap as ErrorMessageMap)[error.code]

  const message =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    typeof msgOrFn === 'function' ? msgOrFn(error.data as any) : msgOrFn

  return message ?? titleCase(error.code)
}

/** unified export. Not sure if it's nice yet but maybe worth a try? */
export const Err = {
  make: makeError,
  throw: throwError,
  parse: parseError,
  is: isError,
  format: formatError,
}

export default Err

// MARK: - Other helpers

export function rethrowZodError(message?: string) {
  return (error: unknown) => {
    if (isZodError(error)) {
      throw makeError('SCHEMA_VALIDATION_ERROR', {
        ...infoFromZodError(error),
        message,
      })
    }
    throw error
  }
}
