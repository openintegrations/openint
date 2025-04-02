/* eslint-disable promise/no-nesting */
import {TRPCError} from '@openint/api-v1'
import type {Z} from '@openint/util/zod-utils'

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
    props.params.then((params): Z.infer<ZParams> => {
      if (schema.params) {
        return schema.params.parseAsync(params).catch((err) => {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `BadRequest: page params ${err}`,
          })
        })
      }
      return params
    }),
    props.searchParams.then((searchParams): Z.infer<ZSearchParams> => {
      if (schema.searchParams) {
        return schema.searchParams.parseAsync(searchParams).catch((err) => {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `BadRequest: page searchParams ${err}`,
          })
        })
      }
      return searchParams
    }),
  ])
  return {
    params,
    searchParams,
  }
}
