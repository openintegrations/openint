import {initGreenhouseSDK, type greenhouseTypes} from '@opensdks/sdk-greenhouse'
import type {ConnectorServer} from '@openint/cdk'
import {NextPageCursor} from '@openint/cdk/cursors'
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
    async listEntities(type, {cursor}) {
      const {next_page: page} = NextPageCursor.deserialize(cursor)
      const isOpening = type === 'opening'
      if (isOpening) {
        console.debug(
          '[greenhouse] opening type detected, using job type instead',
        )
        type = 'job' as typeof type
      }
      const res = await sdk.GET(`/v1/${type as 'job'}s`, {
        params: {query: {per_page: 50, page}},
      })
      const hasNextPage = res.data.length > 0
      const nextCursor = hasNextPage
        ? NextPageCursor.serialize({next_page: page + 1})
        : null

      console.log('[greenhouse] listEntities', {type, page, cursor, nextCursor})
      return {
        entities: isOpening
          ? res.data.flatMap((j) =>
              j.openings.map((o) => ({
                id: `${o.id}`,
                data: {job_id: j.id, ...o},
              })),
            )
          : res.data.map((j) => ({id: `${j.id}`, data: j})),
        next_cursor: nextCursor,
        // TODO: instead check for count / from response header
        has_next_page: hasNextPage,
      }
    },
  }
}
