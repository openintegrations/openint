// Errors should be thought of nothing but events as well.
// To be handled just like any other. With a name and schema.

import type {Z} from '@openint/util/zod-utils'

import {TRPC_ERROR_CODES_BY_KEY} from '@trpc/server/rpc'
import {R} from '@openint/util/remeda'
import {z, zZodErrorInfo} from '@openint/util/zod-utils'

// MARK: - Definitions

export const trpcErrorMap = R.mapValues(TRPC_ERROR_CODES_BY_KEY, () => ({
  message: z.string(),
}))

export const errorMap = {
  ...trpcErrorMap,
  UNKNOWN_ERROR: {message: z.string().optional()},
  INVARIANT_ERROR: {message: z.string().optional()},
  SCHEMA_VALIDATION_ERROR: {
    message: z.string().optional(),
    ...zZodErrorInfo.shape,
  },
  PATH_PARAMS_ERROR: zZodErrorInfo.shape,
  SEARCH_PARAMS_ERROR: zZodErrorInfo.shape,
} satisfies Record<string, Z.ZodRawShape>

/** This is where we can internationalize easily if needed */
export const errorMessageMap = {
  UNKNOWN_ERROR: (data) =>
    ['An unknown error has occurred', data.message].filter(Boolean).join(': '),
  SCHEMA_VALIDATION_ERROR: (data) =>
    data.message ?? 'Data failed to validate against schema',
  PATH_PARAMS_ERROR: 'Path params did not match schema',
  SEARCH_PARAMS_ERROR: 'Search params did not match schema',
} satisfies ErrorMessageMap

// MARK: - Type exports

export type ErrorCode = keyof typeof errorMap

export type ErrorMessageMap = Partial<{
  [k in ErrorCode]:
    | string
    | ((data: Z.infer<Z.ZodObject<(typeof errorMap)[k]>>) => string)
}>
