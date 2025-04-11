import type {Z} from '@openint/util/zod-utils'
import {throwError} from '@openint/events/errors'
import {infoFromZodError} from '@openint/util/zod-utils'

/* eslint-disable promise/no-nesting */

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
          ? schema.params.parseAsync(params).catch((e) => {
              throwError('PATH_PARAMS_ERROR', infoFromZodError(e))
            })
          : params,
    ),
    props.searchParams.then(
      (searchParams): Z.infer<ZSearchParams> =>
        schema.searchParams
          ? schema.searchParams.parseAsync(searchParams).catch((e) => {
              throwError('SEARCH_PARAMS_ERROR', infoFromZodError(e))
            })
          : searchParams,
    ),
  ])
  return {
    params,
    searchParams,
  }
}
