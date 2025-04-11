/* eslint-disable promise/no-nesting */
import type {Z} from '@openint/util/zod-utils'
import {throwErr} from './errors'

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
