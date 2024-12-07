import {initGreenhouseSDK, type greenhouseTypes} from '@opensdks/sdk-greenhouse'
import httpLinkHeader from 'http-link-header'
import type {ConnectorServer} from '@openint/cdk'
import {LastUpdatedAndPage} from '@openint/cdk/cursors'
import type {EtlSource} from '../connector-common'
import {observableFromEtlSource} from '../connector-common'
import {type greenhouseSchema} from './def'

export type GreenhouseSDK = ReturnType<typeof initGreenhouseSDK>

export type GreenhouseTypes = greenhouseTypes

export type GreenhouseObjectType = GreenhouseTypes['components']['schemas']

export const greenhouseServer = {
  newInstance: ({settings}) => {
    const greenhouse = initGreenhouseSDK({
      auth: {basic: {username: settings.apiKey, password: ''}},
    })
    return greenhouse
  },
  sourceSync: ({instance: greenhouse, streams, state}) =>
    // console.log('grenehouse sourceSync', {streams, state})
    observableFromEtlSource(
      greenhouseSource({sdk: greenhouse}),
      streams,
      (state ?? {}) as {},
    ),
} satisfies ConnectorServer<
  typeof greenhouseSchema,
  ReturnType<typeof initGreenhouseSDK>
>

export default greenhouseServer

// TODO: Implement incremental sync
// https://developers.greenhouse.io/harvest.html#get-list-jobs
// TODO2: Implement low-code connector spec
function greenhouseSource({sdk}: {sdk: GreenhouseSDK}): EtlSource<{
  job: GreenhouseObjectType['job']
  candidate: GreenhouseObjectType['candidate']
  application: GreenhouseObjectType['application']
  opening: GreenhouseObjectType['opening']
  offer: GreenhouseObjectType['offer']
}> {
  return {
    // Perhaps allow cursor implementation to be passed in as a parameter
    // @ts-expect-error ile greenhouse sdk is updated
    async listEntities(type, {cursor: cursorStr}) {
      const cursor = LastUpdatedAndPage.deserialize(cursorStr) ?? {page: 1}
      const isOpening = type === 'opening'
      if (isOpening) {
        console.debug(
          '[greenhouse] opening type detected, using job type instead',
        )
        type = 'job' as typeof type
      }

      // console.log('[greenhouse] listEntities', {
      //   type,
      //   cursor,
      //   query: {
      //     per_page: 50,
      //     page: cursor.page,
      //     ...(cursor.last_updated_at &&
      //       ({updated_after: cursor.last_updated_at} as {})),
      //   },
      // })
      const res = await sdk.GET(`/v1/${type as 'job'}s`, {
        params: {
          query: {
            per_page: 50,
            page: cursor.page,
            ...(cursor.last_updated_at &&
              ({updated_after: cursor.last_updated_at} as {})),
          },
        },
      })
      // ISO8601 updatedAt could be compared as number
      const lastUpdatedItem = maxBy(res.data, (item) => item.updated_at)
      cursor.pending_last_updated_at = max([
        lastUpdatedItem?.updated_at,
        cursor.pending_last_updated_at,
      ])
      cursor.page += 1

      // Fall back include if response size is < than the page size
      // though not reliable given server could limit the response size to be less than the page size
      // for page size that are too large.

      const hasNextPage = httpLinkHeader
        .parse(res.response.headers.get('link') ?? '')
        .has('rel', 'next') // && res.data.length > 0 // not needed but for reference

      if (!hasNextPage) {
        cursor.last_updated_at = cursor.pending_last_updated_at
        cursor.page = 1
        delete cursor.pending_last_updated_at
      }

      return {
        entities: isOpening
          ? res.data.flatMap((j) =>
              j.openings.map((o) => ({
                id: `${o.id}`,
                data: {job_id: j.id, ...o},
              })),
            )
          : res.data.map((j) => ({id: `${j.id}`, data: j})),
        next_cursor: LastUpdatedAndPage.serialize(cursor),
        has_next_page: hasNextPage,
      }
    },
  }
}

function maxBy<T, U extends string | null | undefined>(
  values: T[],
  selector: (item: T) => U,
): T | null | undefined {
  if (values.length === 0) {
    return null
  }

  return values.reduce((max, current) => {
    const maxValue = selector(max)
    const currentValue = selector(current)

    if (maxValue == null) {
      return current
    }
    if (currentValue == null) {
      return max
    }

    return currentValue > maxValue ? current : max
  })
}

function max(
  values: Array<string | null | undefined>,
): string | null | undefined {
  const result = maxBy(values, (v) => v)
  return result
}
