import type {NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import {safeJSONParse} from '@openint/util/json-utils'
import {z, zZodErrorInfo} from '@openint/util/zod-utils'

// Errors should be thought of nothing but events as well.
// To be handled just like any other. With a name and schema.

export const errorMap = {
  UNKNOWN_ERROR: {message: z.string()},
  SCHEMA_VALIDATION_ERROR: zZodErrorInfo.shape,
  PATH_PARAM_VALIDATION_ERROR: zZodErrorInfo.shape,
  SEARCH_PARAM_VALIDATION_ERROR: zZodErrorInfo.shape,
} satisfies Record<string, Z.ZodRawShape>

export type ErrorName = keyof typeof errorMap
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

export type AllDiscriminatedError = Z.infer<typeof zDiscriminatedError>
export type DiscriminatedError<TName extends ErrorName> = Extract<
  AllDiscriminatedError,
  {name: TName}
>

export function throwError<TName extends ErrorName>(
  name: TName,
  data: DiscriminatedError<TName>['data'],
): never {
  const schema = errorMap[name]
  const parsedData = z.object(schema).parse(data)
  // Perhaps change to a unknown erro here if it does not pass validation?
  const err = new Error(JSON.stringify(parsedData, null, 2))
  Object.assign(err, {name, data})
  throw err
}

export function parseError(error: unknown): AllDiscriminatedError {
  if (typeof error !== 'object' || error == null) {
    return {name: 'UNKNOWN_ERROR', data: {message: String(error)}}
  }

  const err = error as {
    name?: unknown
    message?: string
    data?: unknown
    digest?: string
  }
  const parsed = zDiscriminatedError.safeParse({
    name: err.name,
    data: err.data ?? safeJSONParse(err.message),
    digest: err.digest,
  })

  return (
    parsed.data ?? {
      name: 'UNKNOWN_ERROR',
      data: {message: String(err as unknown)},
    }
  )
}

export function isError<TName extends ErrorName>(
  error: unknown,
  name?: TName,
): error is DiscriminatedError<TName> {
  return parseError(error).name === name
}
