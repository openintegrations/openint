import type {z} from '@openint/util'

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
  ZParams extends z.ZodTypeAny,
  ZSearchParams extends z.ZodTypeAny,
>(
  props: PageProps,
  schema: {
    params?: ZParams
    searchParams?: ZSearchParams
  },
) {
  const [params, searchParams] = await Promise.all([
    props.params.then((params): z.infer<ZParams> => {
      if (schema.params) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema.params.parse(params)
      }
      return params
    }),
    props.searchParams.then((searchParams): z.infer<ZSearchParams> => {
      if (schema.searchParams) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return schema.searchParams.parse(searchParams)
      }
      return searchParams
    }),
  ])
  return {
    params,
    searchParams,
  }
}
