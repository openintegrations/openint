// Errors should be thought of nothing but events as well.
// To be handled just like any other. With a name and schema.

import type {NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import {TRPCError} from '@trpc/server'
import {TRPC_ERROR_CODES_BY_KEY} from '@trpc/server/rpc'
import {safeJSONParse} from '@openint/util/json-utils'
import {R} from '@openint/util/remeda'
import {titleCase} from '@openint/util/string-utils'
import {z, zZodErrorInfo} from '@openint/util/zod-utils'

// MARK: - Definitions

const trpcErrorMap = R.mapValues(TRPC_ERROR_CODES_BY_KEY, () => ({
  message: z.string(),
}))

export const errorMap = {
  ...trpcErrorMap,
  UNKNOWN_ERROR: {message: z.string()},
  SCHEMA_VALIDATION_ERROR: zZodErrorInfo.shape,
  PATH_PARAMS_ERROR: zZodErrorInfo.shape,
  SEARCH_PARAMS_ERROR: zZodErrorInfo.shape,
} satisfies Record<string, Z.ZodRawShape>

export type ErrorName = keyof typeof errorMap

type ErrorMessageMap = Partial<{
  [k in ErrorName]: string | ((data: DiscriminatedError<k>['data']) => string)
}>

/** This is where we can internationalize easily if needed */
export const errorMessageMap = {
  UNKNOWN_ERROR: 'An unknown error has occurred',
  SCHEMA_VALIDATION_ERROR: 'Data failed to validate against schema',
  PATH_PARAMS_ERROR: 'Path params did not match schema',
  SEARCH_PARAMS_ERROR: 'Search params did not match schema',
} satisfies ErrorMessageMap

// MARK: - Helpers

export const zErrorName = z.enum(Object.keys(errorMap) as [ErrorName])

export const zDiscriminatedError = z.intersection(
  z.object({
    /** nextjs error digest for collelating server side log with error displayed to client */
    digest: z.string().optional(),
  }),
  z.discriminatedUnion(
    'name',
    Object.entries(errorMap).map(([name, shape]) =>
      z.object({
        name: z.literal(name),
        data: z.object(shape),
      }),
    ) as unknown as NonEmptyArray<
      {
        [k in keyof typeof errorMap]: Z.ZodObject<{
          name: Z.ZodLiteral<k>
          data: Z.ZodObject<(typeof errorMap)[k]>
        }>
      }[keyof typeof errorMap]
    >,
  ),
)

export type DiscriminatedError<TName extends ErrorName = ErrorName> = Extract<
  Z.infer<typeof zDiscriminatedError>,
  {name: TName}
>

// MARK: - Primary functions to interact with errors

export function makeError<TName extends ErrorName>(
  name: TName,
  data: DiscriminatedError<TName>['data'],
) {
  const schema = errorMap[name]
  const parsedData = z.object(schema).parse(data)
  const message = JSON.stringify(parsedData, null, 2)

  // Perhaps change to a unknown erro here if it does not pass validation?
  const err =
    name in trpcErrorMap
      ? new TRPCError({code: name as keyof typeof trpcErrorMap, message})
      : new Error(message)
  Object.assign(err, {name, data})
  return err as unknown as Error & DiscriminatedError<TName>
}

export function throwError<TName extends ErrorName>(
  name: TName,
  data: DiscriminatedError<TName>['data'],
) {
  throw makeError(name, data)
}

/** 
 * Should probably be named parsePlainError to distinguish from parseAPIError related logic
 * that try to transform errors we did not "make" into plain error to then be parsed
 */
export function parseError(error: unknown): DiscriminatedError {
  if (typeof error !== 'object' || error == null) {
    return {name: 'UNKNOWN_ERROR', data: {message: String(error)}}
  }

  const err = error as {
    code?: unknown
    name?: unknown
    message?: string
    data?: unknown
    digest?: string
  }
  const parsed = zDiscriminatedError.safeParse({
    // Shall we be more explicit about the different conditions? We handle
    // 1) discriminated error 2) discriminated error with data in JSON message 3) manually constructed trpc error
    name: err.code ?? err.name,
    data: err.data ?? safeJSONParse(err.message) ?? {message: err.message},
    digest: err.digest,
  })

  if (parsed.success) {
    return parsed.data
  }

  return {name: 'UNKNOWN_ERROR', data: {message: String(error as unknown)}}
}

export function isError<TName extends ErrorName>(
  error: unknown,
  name?: TName,
): error is DiscriminatedError<TName> {
  return parseError(error).name === name
}

export function formatError(error: DiscriminatedError) {
  const msgOrFn = (errorMessageMap as ErrorMessageMap)[error.name]

  const message =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    typeof msgOrFn === 'function' ? msgOrFn(error.data as any) : msgOrFn

  return message ?? titleCase(error.name)
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
