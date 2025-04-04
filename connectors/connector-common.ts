import {Rx, rxjs} from '@openint/util/observable-utils'
// MARK: - New way of doing things


export interface EtlSource<
  TEntityMap extends Record<string, unknown> = Record<string, unknown>,
> {
  listEntities<TK extends keyof TEntityMap>(
    type: TK,
    options: {
      cursor?: string | null
      page_size?: number
    },
  ): Promise<{
    entities: Array<{
      id: string
      /** `null` means deleted */
      data: TEntityMap[TK] | null
    }>
    next_cursor: string | null
    has_next_page: boolean
  }>
}

export function observableFromEtlSource(
  source: EtlSource,
  streams: Record<string, boolean | {disabled?: boolean | undefined} | null>,
  state: Record<string, {cursor?: string | null}> = {},
) {
  async function* iterateEntities() {
    for (const streamName of Object.keys(streams)) {
      const streamValue = streams[streamName]
      if (
        !streamValue ||
        (streamValue as {disabled: boolean}).disabled === true
        // Should further check weather streamName is valid for a given connector
      ) {
        continue
      }

      while (true) {
        // console.log(`[sourceSync] ${streamName} pre state`, state)
        const {cursor} = state[streamName] ?? {}
        const {entities, next_cursor, has_next_page} =
          await source.listEntities(streamName, {cursor})
        state[streamName] = {cursor: next_cursor}
        // console.log(
        //   `[sourceSync] ${streamName} ${entities.length} entities `,
        //   state,
        // )

        yield [
          ...entities.map((j) => ({
            type: 'data' as const,
            // We should make the messages easier to construct
            data: {entityName: streamName, id: j.id, entity: j.data},
          })),
          {type: 'stateUpdate', sourceState: state} as never, // type error
        ]

        if (!has_next_page) {
          break
        }
      }
    }
  }
  // DO somethign with the new state...

  return rxjs
    .from(iterateEntities())
    .pipe(Rx.mergeMap((ops) => rxjs.from([...ops, {type: 'commit' as const}])))
}
