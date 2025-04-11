/* eslint-disable promise/no-nesting */
import type {ZodErrorEnriched} from '@openint/util/zod-utils'
import {R} from '@openint/util/remeda'

// TODO: Consider if we should make this more like events.ts that maps from error / code to error schema
export const Errors = {
  ParamValidation: (zodError: ZodErrorEnriched, message?: string) =>
    JSON.stringify({
      message,
      ...R.omit(zodError, ['schema', 'name', 'message']),
    }),
}

export type ErrorName = `${keyof typeof Errors}Error`

export function throwErr<TName extends keyof typeof Errors>(
  name: TName,
  ...args: Parameters<(typeof Errors)[TName]>
): never {
  // @ts-expect-error not sure how to fix this, but it works at runtiem
  const message = Errors[name](...args)
  const err = new Error(message)
  err.name = `${name}Error`
  throw err
}
