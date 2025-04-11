/* eslint-disable promise/no-nesting */
import type {Z, ZodErrorEnriched} from '@openint/util/zod-utils'
import {R} from '@openint/util/remeda'
import {zodToOas31Schema} from '@openint/util/schema'

/** Maybe there is a next.js type for this? */
export type PageProps<
  TParams = {[key: string]: string | undefined},
  TSearchParams = {[key: string]: string | string[] | undefined},
> = {
  params: Promise<TParams>
  searchParams: Promise<TSearchParams>
}

/** TODO: Add better error message for when we fail validation */
export async function parsePageProps<
  ZParams extends Z.ZodTypeAny,
  ZSearchParams extends Z.ZodTypeAny,
>(
  props: PageProps,
  schema: {
    params?: ZParams
    searchParams?: ZSearchParams
  },
) {
  const [params, searchParams] = await Promise.all([
    props.params.then(
      (params): Z.infer<ZParams> =>
        schema.params
          ? schema.params
              .parseAsync(params, {
                errorMap: (_, ctx) => ({
                  message: `Error parsing params: ${ctx.defaultError}`,
                }),
              })
              .catch((e) => {
                throwErr('ParamValidation', e, 'Invalid path params')
              })
          : params,
    ),
    props.searchParams.then(
      (searchParams): Z.infer<ZSearchParams> =>
        schema.searchParams
          ? schema.searchParams
              .parseAsync(searchParams)
              .catch((e) =>
                throwErr('ParamValidation', e, 'Invalid search params'),
              )
          : searchParams,
    ),
  ])
  return {
    params,
    searchParams,
  }
}

// TODO: Consider if we should make this more like events.ts that maps from error / code to error schema
export const Errors = {
  ParamValidation: (zodError: ZodErrorEnriched, message?: string) =>
    JSON.stringify({
      message,
      ...R.omit(zodError, ['schema', 'name', 'message']),
    }),
}

export type ErrorName = `${keyof typeof Errors}Error`

function throwErr<TName extends keyof typeof Errors>(
  name: TName,
  ...args: Parameters<(typeof Errors)[TName]>
): never {
  // @ts-expect-error not sure how to fix this, but it works at runtiem
  const message = Errors[name](...args)
  const err = new Error(message)
  err.name = `${name}Error`
  throw err
}
